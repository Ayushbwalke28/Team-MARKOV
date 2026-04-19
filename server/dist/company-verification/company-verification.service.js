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
var CompanyVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_verification_service_1 = require("./ai-verification.service");
const MANUAL_REVIEW_SLA_HOURS = Number(process.env.COMPANY_VERIFICATION_MANUAL_REVIEW_SLA_HOURS || 24);
let CompanyVerificationService = CompanyVerificationService_1 = class CompanyVerificationService {
    constructor(prisma, aiVerification) {
        this.prisma = prisma;
        this.aiVerification = aiVerification;
        this.logger = new common_1.Logger(CompanyVerificationService_1.name);
    }
    async startVerification(companyId, userId, gstin, cinNumber) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== userId)
            throw new common_1.ForbiddenException('Only the owner can start verification');
        if (company.verificationStatus === 'verified') {
            throw new common_1.BadRequestException('Company is already verified');
        }
        if (company.verificationStatus === 'rejected') {
            throw new common_1.BadRequestException('Company verification was rejected. Please contact support to appeal.');
        }
        await this.prisma.company.update({
            where: { id: companyId },
            data: { gstin, cinNumber: cinNumber ?? company.cinNumber },
        });
        const session = await this.prisma.companyVerificationSession.create({
            data: {
                companyId,
                userId,
                status: 'pending',
                gstin,
                cinNumber: cinNumber ?? null,
            },
        });
        this.logger.log(`Company verification session ${session.id} started for company ${companyId}`);
        return session;
    }
    async submitDocument(sessionId, userId, documentType, fileUrl, incorporationCertUrl) {
        const session = await this.getSession(sessionId, userId);
        if (session.status !== 'pending') {
            throw new common_1.BadRequestException('Documents can only be uploaded when the session is in "pending" state');
        }
        await this.prisma.company.update({
            where: { id: session.companyId },
            data: {
                registrationDocumentUrl: fileUrl,
                ...(incorporationCertUrl ? { incorporationCertUrl } : {}),
            },
        });
        return this.prisma.companyVerificationSession.update({
            where: { id: sessionId },
            data: {
                documentType,
                status: 'document_uploaded',
                registrationDocumentUrl: fileUrl,
                incorporationCertUrl: incorporationCertUrl ?? null,
                documentValid: true,
            },
        });
    }
    async runAiVerification(sessionId, userId) {
        const session = await this.getSession(sessionId, userId);
        if (session.status !== 'document_uploaded') {
            throw new common_1.BadRequestException('Please upload your legal documents before submitting for verification');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: session.companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (!session.gstin) {
            throw new common_1.BadRequestException('GSTIN is missing from the verification session. Please restart verification with your GSTIN.');
        }
        await this.prisma.companyVerificationSession.update({
            where: { id: sessionId },
            data: { status: 'processing' },
        });
        this.logger.log(`Running AI verification for session ${sessionId}`);
        const aiResult = await this.aiVerification.analyzeCompany({
            companyName: company.name,
            gstin: session.gstin,
            cinNumber: session.cinNumber,
            registrationDocumentUrl: session.registrationDocumentUrl ?? company.registrationDocumentUrl,
            incorporationCertUrl: session.incorporationCertUrl ?? company.incorporationCertUrl,
            documentType: session.documentType,
            startYear: company.startYear,
            domain: company.domain,
        });
        this.logger.log(`AI verdict for session ${sessionId}: ${aiResult.verdict} (confidence: ${aiResult.confidence})`);
        let sessionStatus;
        let companyStatus;
        let failureReason = null;
        if (aiResult.verdict === 'approved') {
            sessionStatus = 'passed';
            companyStatus = 'verified';
        }
        else if (aiResult.verdict === 'manual_review') {
            sessionStatus = 'manual_review';
            companyStatus = 'pending';
        }
        else {
            sessionStatus = 'failed';
            companyStatus = 'rejected';
            failureReason = aiResult.reason;
        }
        const updatedSession = await this.prisma.companyVerificationSession.update({
            where: { id: sessionId },
            data: {
                status: sessionStatus,
                apiValidationSuccessful: aiResult.verdict !== 'rejected',
                documentValid: aiResult.verdict !== 'rejected',
                aiVerificationReason: aiResult.reason,
                aiConfidenceScore: aiResult.confidence,
                failureReason,
            },
        });
        await this.prisma.company.update({
            where: { id: session.companyId },
            data: {
                verificationStatus: companyStatus,
                ...(companyStatus === 'verified' ? { verifiedAt: new Date() } : {}),
            },
        });
        if (sessionStatus === 'manual_review') {
            const slaDeadline = new Date();
            slaDeadline.setHours(slaDeadline.getHours() + MANUAL_REVIEW_SLA_HOURS);
            await this.prisma.manualReview.create({
                data: {
                    verificationSessionId: sessionId,
                    reason: `AI flagged for manual review (confidence: ${(aiResult.confidence * 100).toFixed(1)}%): ${aiResult.reason}`,
                    slaDeadline,
                },
            });
        }
        return {
            session: updatedSession,
            aiResult: {
                verdict: aiResult.verdict,
                reason: aiResult.reason,
                confidence: Math.round(aiResult.confidence * 100) / 100,
            },
        };
    }
    async getSessionStatus(sessionId, userId) {
        const session = await this.getSession(sessionId, userId);
        const company = await this.prisma.company.findUnique({
            where: { id: session.companyId },
            select: {
                verificationStatus: true,
                verifiedAt: true,
                gstin: true,
                cinNumber: true,
            },
        });
        return { ...session, company };
    }
    async getSession(sessionId, userId) {
        const session = await this.prisma.companyVerificationSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Verification session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException('Access denied – this is not your session');
        return session;
    }
};
exports.CompanyVerificationService = CompanyVerificationService;
exports.CompanyVerificationService = CompanyVerificationService = CompanyVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_verification_service_1.AiVerificationService])
], CompanyVerificationService);
//# sourceMappingURL=company-verification.service.js.map