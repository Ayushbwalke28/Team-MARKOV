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
var OwnershipClaimService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipClaimService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_verification_service_1 = require("../company-verification/ai-verification.service");
const domain_email_verification_service_1 = require("./domain-email-verification.service");
const gst_crosscheck_service_1 = require("./gst-crosscheck.service");
const admin_decide_claim_dto_1 = require("./dto/admin-decide-claim.dto");
const RECLAIM_COOLDOWN_DAYS = Number(process.env.CLAIM_RECLAIM_COOLDOWN_DAYS || 7);
const ADMIN_REVIEW_SLA_HOURS = Number(process.env.CLAIM_ADMIN_REVIEW_SLA_HOURS || 48);
let OwnershipClaimService = OwnershipClaimService_1 = class OwnershipClaimService {
    constructor(prisma, aiVerification, domainEmail, gstCrosscheck) {
        this.prisma = prisma;
        this.aiVerification = aiVerification;
        this.domainEmail = domainEmail;
        this.gstCrosscheck = gstCrosscheck;
        this.logger = new common_1.Logger(OwnershipClaimService_1.name);
    }
    async createClaim(userId, dto) {
        const company = await this.prisma.company.findUnique({
            where: { id: dto.companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const activeClaim = await this.prisma.companyOwnershipClaim.findFirst({
            where: {
                companyId: dto.companyId,
                status: { notIn: ['rejected', 'withdrawn'] },
                NOT: { claimantId: userId },
            },
        });
        if (activeClaim) {
            throw new common_1.ConflictException('This company already has a pending or approved ownership claim. Contact support if you believe this is an error.');
        }
        const recentRejected = await this.prisma.companyOwnershipClaim.findFirst({
            where: {
                companyId: dto.companyId,
                claimantId: userId,
                status: 'rejected',
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (recentRejected) {
            const cooldownExpiry = new Date(recentRejected.updatedAt);
            cooldownExpiry.setDate(cooldownExpiry.getDate() + RECLAIM_COOLDOWN_DAYS);
            if (cooldownExpiry > new Date()) {
                throw new common_1.BadRequestException(`Your previous claim was rejected. You may re-claim after ${cooldownExpiry.toDateString()}.`);
            }
        }
        return this.prisma.companyOwnershipClaim.upsert({
            where: { companyId_claimantId: { companyId: dto.companyId, claimantId: userId } },
            update: {
                status: 'pending',
                verificationMethod: null,
                requestedRole: dto.requestedRole ?? 'owner',
                rejectionReason: null,
                domainEmail: null,
                domainVerifiedAt: null,
                authorizationLetterUrl: null,
                governmentIdUrl: null,
                documentVerifiedAt: null,
                submittedGstin: null,
                submittedCin: null,
                gstNameMatch: null,
                gstValidatedAt: null,
                adminDecision: null,
                adminNotes: null,
                adminReviewedAt: null,
                adminReviewedBy: null,
            },
            create: {
                companyId: dto.companyId,
                claimantId: userId,
                requestedRole: dto.requestedRole ?? 'owner',
            },
        });
    }
    async sendDomainOtp(claimId, userId, email) {
        const claim = await this.getClaim(claimId, userId);
        this.assertClaimEditable(claim);
        const company = await this.prisma.company.findUnique({
            where: { id: claim.companyId },
        });
        if (!company?.domain) {
            throw new common_1.BadRequestException('This company has no registered domain. Use a different verification method.');
        }
        if (!this.domainEmail.validateEmailDomain(email, company.domain)) {
            throw new common_1.BadRequestException(`Email domain must match the company domain "@${company.domain}"`);
        }
        await this.domainEmail.sendOtp(claimId, email);
        return { message: `OTP sent to ${email}. Valid for 15 minutes.` };
    }
    async verifyDomainOtp(claimId, userId, otp) {
        const claim = await this.getClaim(claimId, userId);
        if (claim.status !== 'domain_otp_sent') {
            throw new common_1.BadRequestException('Please send the domain OTP first.');
        }
        const match = await this.domainEmail.verifyOtp(claimId, otp);
        if (!match) {
            throw new common_1.GoneException('OTP is invalid or has expired. Please request a new one.');
        }
        return this.approveClaim(claim, userId, 'domain_email');
    }
    async uploadDocuments(claimId, userId, authorizationLetterUrl, governmentIdUrl) {
        const claim = await this.getClaim(claimId, userId);
        this.assertClaimEditable(claim);
        const company = await this.prisma.company.findUnique({
            where: { id: claim.companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        await this.prisma.companyOwnershipClaim.update({
            where: { id: claimId },
            data: {
                authorizationLetterUrl,
                governmentIdUrl: governmentIdUrl ?? null,
                status: 'document_uploaded',
                verificationMethod: 'business_document',
            },
        });
        const claimant = await this.prisma.user.findUnique({ where: { id: userId } });
        const aiResult = await this.aiVerification.analyzeCompany({
            companyName: company.name,
            gstin: company.gstin,
            cinNumber: company.cinNumber,
            registrationDocumentUrl: authorizationLetterUrl,
            incorporationCertUrl: governmentIdUrl ?? null,
            documentType: `authorization_letter${governmentIdUrl ? '+gov_id' : ''}`,
            startYear: company.startYear,
            domain: company.domain,
        });
        this.logger.log(`AI ownership verdict for claim ${claimId}: ${aiResult.verdict} (confidence: ${aiResult.confidence})`);
        if (aiResult.verdict === 'approved') {
            return this.approveClaim({ ...claim, verificationMethod: 'business_document' }, userId, 'business_document');
        }
        else if (aiResult.verdict === 'manual_review') {
            await this.escalateToAdminReview(claimId, `AI flagged for manual review: ${aiResult.reason}`);
            return {
                status: 'under_admin_review',
                message: 'Your documents are under admin review. You will be notified within 48 hours.',
                aiReason: aiResult.reason,
            };
        }
        else {
            await this.prisma.companyOwnershipClaim.update({
                where: { id: claimId },
                data: { status: 'rejected', rejectionReason: aiResult.reason },
            });
            return {
                status: 'rejected',
                message: 'Document verification failed.',
                reason: aiResult.reason,
            };
        }
    }
    async validateGstin(claimId, userId, gstin, cinNumber) {
        const claim = await this.getClaim(claimId, userId);
        this.assertClaimEditable(claim);
        const company = await this.prisma.company.findUnique({
            where: { id: claim.companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const result = await this.gstCrosscheck.crossCheckGstin(gstin, company.name);
        await this.prisma.companyOwnershipClaim.update({
            where: { id: claimId },
            data: {
                submittedGstin: gstin,
                submittedCin: cinNumber ?? null,
                gstNameMatch: result.nameMatch,
                gstValidatedAt: new Date(),
                status: 'gst_validated',
                verificationMethod: 'gst_registration',
            },
        });
        await this.escalateToAdminReview(claimId, result.nameMatch
            ? `GST name matched (${result.reason}). Pending admin confirmation.`
            : `GST name mismatch – ${result.reason}. Admin review required.`);
        return {
            status: 'under_admin_review',
            gstResult: result,
            message: result.nameMatch
                ? 'GST validation passed. Your claim is pending admin confirmation.'
                : 'GST name did not match. An admin will review your claim.',
        };
    }
    async requestAdminReview(claimId, userId) {
        const claim = await this.getClaim(claimId, userId);
        this.assertClaimEditable(claim);
        const hasEvidence = claim.domainEmail ||
            claim.authorizationLetterUrl ||
            claim.submittedGstin;
        if (!hasEvidence) {
            throw new common_1.BadRequestException('Please provide at least one piece of evidence (domain email, document, or GSTIN) before requesting admin review.');
        }
        await this.escalateToAdminReview(claimId, 'User manually requested admin review.');
        return {
            status: 'under_admin_review',
            message: 'Your claim has been escalated to admin review. Expect a response within 48 hours.',
        };
    }
    async getMyClaims(userId) {
        return this.prisma.companyOwnershipClaim.findMany({
            where: { claimantId: userId },
            include: {
                company: { select: { id: true, name: true, domain: true, logoUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getClaimDetail(claimId, userId) {
        return this.getClaim(claimId, userId);
    }
    async withdrawClaim(claimId, userId) {
        const claim = await this.getClaim(claimId, userId);
        if (claim.status === 'approved') {
            throw new common_1.ForbiddenException('An approved claim cannot be withdrawn.');
        }
        return this.prisma.companyOwnershipClaim.update({
            where: { id: claimId },
            data: { status: 'withdrawn' },
        });
    }
    async adminListClaims(status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = status ? { status: status } : {};
        const [data, total] = await Promise.all([
            this.prisma.companyOwnershipClaim.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    company: { select: { id: true, name: true, domain: true } },
                    claimant: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.companyOwnershipClaim.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async adminGetClaimDetail(claimId) {
        const claim = await this.prisma.companyOwnershipClaim.findUnique({
            where: { id: claimId },
            include: {
                company: true,
                claimant: { select: { id: true, name: true, email: true, avatarUrl: true } },
                domainVerificationToken: true,
            },
        });
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        return claim;
    }
    async adminGetStats() {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const [pending, underAdminReview, approvedToday, rejectedToday,] = await Promise.all([
            this.prisma.companyOwnershipClaim.count({ where: { status: 'pending' } }),
            this.prisma.companyOwnershipClaim.count({ where: { status: 'under_admin_review' } }),
            this.prisma.companyOwnershipClaim.count({
                where: { status: 'approved', updatedAt: { gte: startOfDay } },
            }),
            this.prisma.companyOwnershipClaim.count({
                where: { status: 'rejected', updatedAt: { gte: startOfDay } },
            }),
        ]);
        const slaThreshold = new Date();
        slaThreshold.setHours(slaThreshold.getHours() - ADMIN_REVIEW_SLA_HOURS);
        const slaBreached = await this.prisma.companyOwnershipClaim.count({
            where: {
                status: 'under_admin_review',
                updatedAt: { lt: slaThreshold },
            },
        });
        return { pending, under_admin_review: underAdminReview, approved_today: approvedToday, rejected_today: rejectedToday, sla_breached: slaBreached };
    }
    async adminDecide(claimId, adminId, dto) {
        const claim = await this.prisma.companyOwnershipClaim.findUnique({
            where: { id: claimId },
        });
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        if (claim.status !== 'under_admin_review' && claim.status !== 'gst_validated' && claim.status !== 'document_uploaded') {
            throw new common_1.BadRequestException(`Claim is in status "${claim.status}" and cannot be decided now.`);
        }
        if (dto.decision === admin_decide_claim_dto_1.AdminDecision.approved) {
            const grantRole = dto.grantRole ?? claim.requestedRole;
            return this.approveClaim({ ...claim, verificationMethod: claim.verificationMethod ?? 'admin_review' }, claim.claimantId, claim.verificationMethod ?? 'admin_review', adminId, dto.notes, grantRole);
        }
        else {
            await this.prisma.companyOwnershipClaim.update({
                where: { id: claimId },
                data: {
                    status: 'rejected',
                    adminDecision: 'rejected',
                    adminNotes: dto.notes,
                    adminReviewedAt: new Date(),
                    adminReviewedBy: adminId,
                    rejectionReason: dto.notes,
                },
            });
            return { status: 'rejected', message: 'Claim rejected by admin.' };
        }
    }
    async getClaim(claimId, userId) {
        const claim = await this.prisma.companyOwnershipClaim.findUnique({
            where: { id: claimId },
        });
        if (!claim)
            throw new common_1.NotFoundException('Ownership claim not found');
        if (claim.claimantId !== userId) {
            throw new common_1.ForbiddenException('Access denied – this is not your claim');
        }
        return claim;
    }
    assertClaimEditable(claim) {
        const nonEditable = ['approved', 'rejected', 'withdrawn'];
        if (nonEditable.includes(claim.status)) {
            throw new common_1.BadRequestException(`Claim is already in "${claim.status}" state and cannot be modified.`);
        }
    }
    async escalateToAdminReview(claimId, reason) {
        await this.prisma.companyOwnershipClaim.update({
            where: { id: claimId },
            data: { status: 'under_admin_review' },
        });
        this.logger.log(`Claim ${claimId} escalated to admin review: ${reason}`);
    }
    async approveClaim(claim, userId, method, adminId, adminNotes, grantRole) {
        const roleToGrant = (grantRole ?? claim.requestedRole ?? 'owner');
        await this.prisma.companyOwnershipClaim.update({
            where: { id: claim.id },
            data: {
                status: 'approved',
                verificationMethod: method,
                domainVerifiedAt: method === 'domain_email' ? new Date() : undefined,
                documentVerifiedAt: method === 'business_document' ? new Date() : undefined,
                ...(adminId
                    ? {
                        adminDecision: 'approved',
                        adminNotes: adminNotes ?? null,
                        adminReviewedAt: new Date(),
                        adminReviewedBy: adminId,
                    }
                    : {}),
            },
        });
        await this.prisma.companyRole.upsert({
            where: { companyId_userId: { companyId: claim.companyId, userId } },
            update: { role: roleToGrant, grantedBy: adminId ?? null, grantedAt: new Date() },
            create: {
                companyId: claim.companyId,
                userId,
                role: roleToGrant,
                grantedBy: adminId ?? null,
            },
        });
        if (roleToGrant === 'owner' || roleToGrant === 'founder') {
            const company = await this.prisma.company.findUnique({
                where: { id: claim.companyId },
            });
            if (company && company.ownerId !== userId) {
                await this.prisma.companyRole.upsert({
                    where: { companyId_userId: { companyId: claim.companyId, userId: company.ownerId } },
                    update: { role: 'founder' },
                    create: { companyId: claim.companyId, userId: company.ownerId, role: 'founder' },
                });
            }
            await this.prisma.company.update({
                where: { id: claim.companyId },
                data: { ownerId: userId },
            });
            await this.prisma.userRole.upsert({
                where: { userId_role: { userId, role: 'company_owner' } },
                update: {},
                create: { userId, role: 'company_owner' },
            });
        }
        await this.prisma.companyOwnershipClaim.updateMany({
            where: {
                companyId: claim.companyId,
                id: { not: claim.id },
                status: { notIn: ['approved', 'rejected', 'withdrawn'] },
            },
            data: { status: 'withdrawn' },
        });
        this.logger.log(`Claim ${claim.id} approved. User ${userId} granted "${roleToGrant}" on company ${claim.companyId}`);
        return {
            status: 'approved',
            role: roleToGrant,
            companyId: claim.companyId,
            message: `Ownership claim approved. You have been granted the "${roleToGrant}" role.`,
        };
    }
};
exports.OwnershipClaimService = OwnershipClaimService;
exports.OwnershipClaimService = OwnershipClaimService = OwnershipClaimService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_verification_service_1.AiVerificationService,
        domain_email_verification_service_1.DomainEmailVerificationService,
        gst_crosscheck_service_1.GstCrosscheckService])
], OwnershipClaimService);
//# sourceMappingURL=ownership-claim.service.js.map