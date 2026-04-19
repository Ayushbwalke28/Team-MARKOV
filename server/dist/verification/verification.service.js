"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ocr_service_1 = require("./ocr.service");
const document_validator_service_1 = require("./document-validator.service");
const face_service_1 = require("./face.service");
const verification_events_service_1 = require("./verification-events.service");
const MAX_ATTEMPTS = Number(process.env.VERIFICATION_MAX_ATTEMPTS || 3);
const FACE_MATCH_THRESHOLD = Number(process.env.VERIFICATION_FACE_MATCH_THRESHOLD || 0.85);
const FACE_REVIEW_THRESHOLD = Number(process.env.VERIFICATION_FACE_REVIEW_THRESHOLD || 0.70);
const MANUAL_REVIEW_SLA_HOURS = Number(process.env.VERIFICATION_MANUAL_REVIEW_SLA_HOURS || 24);
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(prisma, ocrService, documentValidator, faceService, events) {
        this.prisma = prisma;
        this.ocrService = ocrService;
        this.documentValidator = documentValidator;
        this.faceService = faceService;
        this.events = events;
        this.logger = new common_1.Logger(VerificationService_1.name);
        this.idImageBuffers = new Map();
    }
    async startSession(userId) {
        const attemptCount = await this.prisma.verificationSession.count({
            where: { userId },
        });
        if (attemptCount >= MAX_ATTEMPTS) {
            const latest = await this.prisma.verificationSession.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            if (latest && latest.status !== 'locked') {
                await this.prisma.verificationSession.update({
                    where: { id: latest.id },
                    data: { status: 'locked', failureReason: 'Maximum verification attempts exceeded' },
                });
            }
            throw new common_1.ForbiddenException('Maximum verification attempts exceeded. Please contact support.');
        }
        const active = await this.prisma.verificationSession.findFirst({
            where: {
                userId,
                status: { in: ['pending', 'document_uploaded', 'face_captured', 'processing'] },
            },
        });
        if (active) {
            return this.formatSession(active);
        }
        const session = await this.prisma.verificationSession.create({
            data: {
                userId,
                attemptNumber: attemptCount + 1,
            },
        });
        this.events.emit('verification.started', {
            sessionId: session.id,
            userId,
            status: 'pending',
        });
        return this.formatSession(session);
    }
    async recordConsent(sessionId, userId) {
        const session = await this.getSession(sessionId, userId);
        return this.prisma.verificationSession.update({
            where: { id: session.id },
            data: { consentGiven: true, consentTimestamp: new Date() },
        });
    }
    async uploadDocument(sessionId, userId, documentType, frontBuffer, backBuffer) {
        const session = await this.getSession(sessionId, userId);
        if (!session.consentGiven) {
            throw new common_1.BadRequestException('User consent is required before uploading documents');
        }
        if (!['pending'].includes(session.status)) {
            throw new common_1.BadRequestException('Document can only be uploaded in pending state');
        }
        const rawText = await this.ocrService.extractText(frontBuffer);
        const parsed = this.ocrService.parseDocument(rawText, documentType);
        if (backBuffer) {
            const backText = await this.ocrService.extractText(backBuffer);
            const backParsed = this.ocrService.parseDocument(backText, documentType);
            if (!parsed.address && backParsed.address)
                parsed.address = backParsed.address;
            if (!parsed.name && backParsed.name)
                parsed.name = backParsed.name;
        }
        const validation = await this.documentValidator.validateDocument(parsed, frontBuffer, documentType);
        this.idImageBuffers.set(sessionId, frontBuffer);
        const updated = await this.prisma.verificationSession.update({
            where: { id: session.id },
            data: {
                status: validation.isValid ? 'document_uploaded' : 'failed',
                documentType: documentType,
                ocrName: parsed.name,
                ocrDob: parsed.dob,
                ocrIdNumber: parsed.idNumber,
                ocrExpiry: parsed.expiry,
                ocrAddress: parsed.address,
                documentValid: validation.isValid,
                documentExpired: validation.isExpired,
                documentBlurry: validation.isBlurry,
                documentTampered: validation.isTampered,
                failureReason: validation.isValid
                    ? null
                    : validation.issues.join('; '),
            },
        });
        if (!validation.isValid) {
            this.idImageBuffers.delete(sessionId);
            this.events.emit('verification.failed', {
                sessionId: session.id,
                userId,
                status: 'failed',
                reason: validation.issues.join('; '),
            });
        }
        return {
            session: this.formatSession(updated),
            ocrData: {
                name: parsed.name,
                dob: parsed.dob,
                idNumber: parsed.idNumber ? this.maskIdNumber(parsed.idNumber) : null,
                expiry: parsed.expiry,
                address: parsed.address,
            },
            validation: {
                isValid: validation.isValid,
                issues: validation.issues,
            },
        };
    }
    async captureFace(sessionId, userId, selfieBuffer) {
        const session = await this.getSession(sessionId, userId);
        if (session.status !== 'document_uploaded') {
            throw new common_1.BadRequestException('Document must be uploaded before face capture');
        }
        await this.prisma.verificationSession.update({
            where: { id: session.id },
            data: { status: 'processing' },
        });
        const livenessPass = await this.faceService.analyzeLiveness(selfieBuffer);
        const idImageBuffer = this.idImageBuffers.get(sessionId);
        let faceMatchScore = 0;
        if (idImageBuffer) {
            const comparison = await this.faceService.compareFaces(idImageBuffer, selfieBuffer);
            faceMatchScore = comparison.similarity;
        }
        this.idImageBuffers.delete(sessionId);
        const confidenceScore = livenessPass
            ? faceMatchScore
            : faceMatchScore * 0.5;
        let status;
        let failureReason = null;
        if (!livenessPass) {
            status = 'failed';
            failureReason = 'Liveness check failed — possible spoofing detected';
        }
        else if (confidenceScore >= FACE_MATCH_THRESHOLD) {
            status = 'passed';
        }
        else if (confidenceScore >= FACE_REVIEW_THRESHOLD) {
            status = 'manual_review';
        }
        else {
            status = 'failed';
            failureReason = 'Face does not match the document photo';
        }
        const updated = await this.prisma.verificationSession.update({
            where: { id: session.id },
            data: {
                status: status,
                faceMatchScore,
                livenessPass,
                confidenceScore,
                failureReason,
            },
        });
        if (status === 'passed') {
            await this.prisma.user.update({
                where: { id: userId },
                data: { verified: true },
            });
            this.events.emit('verification.passed', {
                sessionId: session.id,
                userId,
                status: 'passed',
                confidence: confidenceScore,
            });
        }
        else if (status === 'manual_review') {
            const slaDeadline = new Date();
            slaDeadline.setHours(slaDeadline.getHours() + MANUAL_REVIEW_SLA_HOURS);
            await this.prisma.manualReview.create({
                data: {
                    verificationSessionId: session.id,
                    reason: `Borderline confidence score: ${(confidenceScore * 100).toFixed(1)}%`,
                    slaDeadline,
                },
            });
            this.events.emit('verification.manual_review', {
                sessionId: session.id,
                userId,
                status: 'manual_review',
                confidence: confidenceScore,
            });
        }
        else {
            this.events.emit('verification.failed', {
                sessionId: session.id,
                userId,
                status: 'failed',
                reason: failureReason || undefined,
            });
        }
        return {
            session: this.formatSession(updated),
            result: {
                status,
                confidence: Math.round(confidenceScore * 100) / 100,
                livenessPass,
                reason: failureReason,
            },
        };
    }
    async getSessionStatus(sessionId, userId) {
        const session = await this.getSession(sessionId, userId);
        return this.formatSession(session);
    }
    async getUserVerificationStatus(userId) {
        const session = await this.prisma.verificationSession.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (!session)
            return null;
        return this.formatSession(session);
    }
    async deleteUserData(userId) {
        await this.prisma.verificationSession.updateMany({
            where: { userId },
            data: {
                ocrName: null,
                ocrDob: null,
                ocrIdNumber: null,
                ocrExpiry: null,
                ocrAddress: null,
                rawDataDeletedAt: new Date(),
            },
        });
        return { message: 'Verification data has been deleted' };
    }
    async getSession(sessionId, userId) {
        const session = await this.prisma.verificationSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Verification session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return session;
    }
    formatSession(session) {
        return {
            id: session.id,
            status: session.status,
            documentType: session.documentType,
            confidenceScore: session.confidenceScore,
            failureReason: session.failureReason,
            attemptNumber: session.attemptNumber,
            consentGiven: session.consentGiven,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        };
    }
    maskIdNumber(idNumber) {
        if (idNumber.length <= 4)
            return '****';
        return '*'.repeat(idNumber.length - 4) + idNumber.slice(-4);
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ocr_service_1.OcrService,
        document_validator_service_1.DocumentValidatorService,
        face_service_1.FaceService,
        verification_events_service_1.VerificationEventsService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map