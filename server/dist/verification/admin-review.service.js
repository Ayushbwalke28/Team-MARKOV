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
var AdminReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const verification_events_service_1 = require("./verification-events.service");
let AdminReviewService = AdminReviewService_1 = class AdminReviewService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
        this.logger = new common_1.Logger(AdminReviewService_1.name);
    }
    async getQueue(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.status === 'pending') {
            where.reviewDecision = null;
        }
        else if (filters.status === 'reviewed') {
            where.reviewDecision = { not: null };
        }
        const [items, total] = await Promise.all([
            this.prisma.manualReview.findMany({
                where,
                include: {
                    verificationSession: {
                        select: {
                            id: true,
                            userId: true,
                            status: true,
                            documentType: true,
                            confidenceScore: true,
                            faceMatchScore: true,
                            livenessPass: true,
                            attemptNumber: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { slaDeadline: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.manualReview.count({ where }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    async getReviewDetail(reviewId) {
        const review = await this.prisma.manualReview.findUnique({
            where: { id: reviewId },
            include: {
                verificationSession: {
                    select: {
                        id: true,
                        userId: true,
                        status: true,
                        documentType: true,
                        confidenceScore: true,
                        faceMatchScore: true,
                        livenessPass: true,
                        documentValid: true,
                        documentExpired: true,
                        documentBlurry: true,
                        documentTampered: true,
                        attemptNumber: true,
                        failureReason: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return review;
    }
    async submitDecision(reviewId, adminId, decision, notes) {
        const review = await this.prisma.manualReview.findUnique({
            where: { id: reviewId },
            include: { verificationSession: true },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const updatedReview = await this.prisma.manualReview.update({
            where: { id: reviewId },
            data: {
                reviewedBy: adminId,
                reviewDecision: decision,
                reviewNotes: notes || null,
                reviewedAt: new Date(),
            },
        });
        const newStatus = decision === 'approved' ? 'passed' : 'failed';
        await this.prisma.verificationSession.update({
            where: { id: review.verificationSessionId },
            data: {
                status: newStatus,
                failureReason: decision === 'rejected'
                    ? `Manually rejected: ${notes || 'No reason provided'}`
                    : null,
            },
        });
        if (decision === 'approved') {
            await this.prisma.user.update({
                where: { id: review.verificationSession.userId },
                data: { verified: true },
            });
            this.events.emit('verification.passed', {
                sessionId: review.verificationSessionId,
                userId: review.verificationSession.userId,
                status: 'passed',
                reason: 'Manually approved by admin',
            });
        }
        else {
            this.events.emit('verification.failed', {
                sessionId: review.verificationSessionId,
                userId: review.verificationSession.userId,
                status: 'failed',
                reason: `Manually rejected: ${notes || 'No reason provided'}`,
            });
        }
        return updatedReview;
    }
    async getAuditLog(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.manualReview.findMany({
                where: { reviewDecision: { not: null } },
                include: {
                    verificationSession: {
                        select: {
                            id: true,
                            userId: true,
                            documentType: true,
                            confidenceScore: true,
                        },
                    },
                },
                orderBy: { reviewedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.manualReview.count({ where: { reviewDecision: { not: null } } }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
};
exports.AdminReviewService = AdminReviewService;
exports.AdminReviewService = AdminReviewService = AdminReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        verification_events_service_1.VerificationEventsService])
], AdminReviewService);
//# sourceMappingURL=admin-review.service.js.map