import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiVerificationService } from '../company-verification/ai-verification.service';
import { DomainEmailVerificationService } from './domain-email-verification.service';
import { GstCrosscheckService } from './gst-crosscheck.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { AdminDecideClaimDto, AdminDecision } from './dto/admin-decide-claim.dto';

const RECLAIM_COOLDOWN_DAYS = Number(process.env.CLAIM_RECLAIM_COOLDOWN_DAYS || 7);
const ADMIN_REVIEW_SLA_HOURS = Number(process.env.CLAIM_ADMIN_REVIEW_SLA_HOURS || 48);

@Injectable()
export class OwnershipClaimService {
  private readonly logger = new Logger(OwnershipClaimService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiVerification: AiVerificationService,
    private readonly domainEmail: DomainEmailVerificationService,
    private readonly gstCrosscheck: GstCrosscheckService,
  ) {}

  // ─── Create Claim ─────────────────────────────────────────────────────────────

  async createClaim(userId: string, dto: CreateClaimDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    // Layer 4: block if another active claim already exists
    const activeClaim = await this.prisma.companyOwnershipClaim.findFirst({
      where: {
        companyId: dto.companyId,
        status: { notIn: ['rejected', 'withdrawn'] },
        NOT: { claimantId: userId },
      },
    });
    if (activeClaim) {
      throw new ConflictException(
        'This company already has a pending or approved ownership claim. Contact support if you believe this is an error.',
      );
    }

    // Check cooldown for rejected claims
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
        throw new BadRequestException(
          `Your previous claim was rejected. You may re-claim after ${cooldownExpiry.toDateString()}.`,
        );
      }
    }

    // Upsert: allow re-use of a withdrawn claim slot
    return this.prisma.companyOwnershipClaim.upsert({
      where: { companyId_claimantId: { companyId: dto.companyId, claimantId: userId } },
      update: {
        status: 'pending',
        verificationMethod: null,
        requestedRole: (dto.requestedRole as any) ?? 'owner',
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
        requestedRole: (dto.requestedRole as any) ?? 'owner',
      },
    });
  }

  // ─── Domain Email: Send OTP ───────────────────────────────────────────────────

  async sendDomainOtp(claimId: string, userId: string, email: string) {
    const claim = await this.getClaim(claimId, userId);
    this.assertClaimEditable(claim);

    const company = await this.prisma.company.findUnique({
      where: { id: claim.companyId },
    });
    if (!company?.domain) {
      throw new BadRequestException(
        'This company has no registered domain. Use a different verification method.',
      );
    }

    if (!this.domainEmail.validateEmailDomain(email, company.domain)) {
      throw new BadRequestException(
        `Email domain must match the company domain "@${company.domain}"`,
      );
    }

    await this.domainEmail.sendOtp(claimId, email);
    return { message: `OTP sent to ${email}. Valid for 15 minutes.` };
  }

  // ─── Domain Email: Verify OTP ─────────────────────────────────────────────────

  async verifyDomainOtp(claimId: string, userId: string, otp: string) {
    const claim = await this.getClaim(claimId, userId);
    if (claim.status !== 'domain_otp_sent') {
      throw new BadRequestException('Please send the domain OTP first.');
    }

    const match = await this.domainEmail.verifyOtp(claimId, otp);
    if (!match) {
      throw new GoneException('OTP is invalid or has expired. Please request a new one.');
    }

    return this.approveClaim(claim, userId, 'domain_email');
  }

  // ─── Document Upload ──────────────────────────────────────────────────────────

  async uploadDocuments(
    claimId: string,
    userId: string,
    authorizationLetterUrl: string,
    governmentIdUrl?: string,
  ) {
    const claim = await this.getClaim(claimId, userId);
    this.assertClaimEditable(claim);

    const company = await this.prisma.company.findUnique({
      where: { id: claim.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    // Update claim with document URLs
    await this.prisma.companyOwnershipClaim.update({
      where: { id: claimId },
      data: {
        authorizationLetterUrl,
        governmentIdUrl: governmentIdUrl ?? null,
        status: 'document_uploaded',
        verificationMethod: 'business_document',
      },
    });

    // Run AI analysis
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

    this.logger.log(
      `AI ownership verdict for claim ${claimId}: ${aiResult.verdict} (confidence: ${aiResult.confidence})`,
    );

    if (aiResult.verdict === 'approved') {
      return this.approveClaim(
        { ...claim, verificationMethod: 'business_document' },
        userId,
        'business_document',
      );
    } else if (aiResult.verdict === 'manual_review') {
      await this.escalateToAdminReview(claimId, `AI flagged for manual review: ${aiResult.reason}`);
      return {
        status: 'under_admin_review',
        message: 'Your documents are under admin review. You will be notified within 48 hours.',
        aiReason: aiResult.reason,
      };
    } else {
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

  // ─── GST Validation ───────────────────────────────────────────────────────────

  async validateGstin(
    claimId: string,
    userId: string,
    gstin: string,
    cinNumber?: string,
  ) {
    const claim = await this.getClaim(claimId, userId);
    this.assertClaimEditable(claim);

    const company = await this.prisma.company.findUnique({
      where: { id: claim.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

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

    // Always escalate to admin after GST validation (trade name ambiguity)
    await this.escalateToAdminReview(
      claimId,
      result.nameMatch
        ? `GST name matched (${result.reason}). Pending admin confirmation.`
        : `GST name mismatch – ${result.reason}. Admin review required.`,
    );

    return {
      status: 'under_admin_review',
      gstResult: result,
      message: result.nameMatch
        ? 'GST validation passed. Your claim is pending admin confirmation.'
        : 'GST name did not match. An admin will review your claim.',
    };
  }

  // ─── Request Admin Review ─────────────────────────────────────────────────────

  async requestAdminReview(claimId: string, userId: string) {
    const claim = await this.getClaim(claimId, userId);
    this.assertClaimEditable(claim);

    // Require at least one piece of evidence
    const hasEvidence =
      claim.domainEmail ||
      claim.authorizationLetterUrl ||
      claim.submittedGstin;

    if (!hasEvidence) {
      throw new BadRequestException(
        'Please provide at least one piece of evidence (domain email, document, or GSTIN) before requesting admin review.',
      );
    }

    await this.escalateToAdminReview(claimId, 'User manually requested admin review.');
    return {
      status: 'under_admin_review',
      message: 'Your claim has been escalated to admin review. Expect a response within 48 hours.',
    };
  }

  // ─── Get My Claims ────────────────────────────────────────────────────────────

  async getMyClaims(userId: string) {
    return this.prisma.companyOwnershipClaim.findMany({
      where: { claimantId: userId },
      include: {
        company: { select: { id: true, name: true, domain: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClaimDetail(claimId: string, userId: string) {
    return this.getClaim(claimId, userId);
  }

  async withdrawClaim(claimId: string, userId: string) {
    const claim = await this.getClaim(claimId, userId);
    if (claim.status === 'approved') {
      throw new ForbiddenException('An approved claim cannot be withdrawn.');
    }
    return this.prisma.companyOwnershipClaim.update({
      where: { id: claimId },
      data: { status: 'withdrawn' },
    });
  }

  // ─── Admin: List All Claims ───────────────────────────────────────────────────

  async adminListClaims(
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};
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

  async adminGetClaimDetail(claimId: string) {
    const claim = await this.prisma.companyOwnershipClaim.findUnique({
      where: { id: claimId },
      include: {
        company: true,
        claimant: { select: { id: true, name: true, email: true, avatarUrl: true } },
        domainVerificationToken: true,
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  async adminGetStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const [
      pending,
      underAdminReview,
      approvedToday,
      rejectedToday,
    ] = await Promise.all([
      this.prisma.companyOwnershipClaim.count({ where: { status: 'pending' } }),
      this.prisma.companyOwnershipClaim.count({ where: { status: 'under_admin_review' } }),
      this.prisma.companyOwnershipClaim.count({
        where: { status: 'approved', updatedAt: { gte: startOfDay } },
      }),
      this.prisma.companyOwnershipClaim.count({
        where: { status: 'rejected', updatedAt: { gte: startOfDay } },
      }),
    ]);

    // SLA breach: under_admin_review claims older than SLA hours
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

  async adminDecide(claimId: string, adminId: string, dto: AdminDecideClaimDto) {
    const claim = await this.prisma.companyOwnershipClaim.findUnique({
      where: { id: claimId },
    });
    if (!claim) throw new NotFoundException('Claim not found');

    if (claim.status !== 'under_admin_review' && claim.status !== 'gst_validated' && claim.status !== 'document_uploaded') {
      throw new BadRequestException(`Claim is in status "${claim.status}" and cannot be decided now.`);
    }

    if (dto.decision === AdminDecision.approved) {
      const grantRole = dto.grantRole ?? (claim.requestedRole as any);
      return this.approveClaim(
        { ...claim, verificationMethod: claim.verificationMethod ?? 'admin_review' },
        claim.claimantId,
        claim.verificationMethod ?? 'admin_review',
        adminId,
        dto.notes,
        grantRole,
      );
    } else {
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

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private async getClaim(claimId: string, userId: string) {
    const claim = await this.prisma.companyOwnershipClaim.findUnique({
      where: { id: claimId },
    });
    if (!claim) throw new NotFoundException('Ownership claim not found');
    if (claim.claimantId !== userId) {
      throw new ForbiddenException('Access denied – this is not your claim');
    }
    return claim;
  }

  private assertClaimEditable(claim: any) {
    const nonEditable = ['approved', 'rejected', 'withdrawn'];
    if (nonEditable.includes(claim.status)) {
      throw new BadRequestException(
        `Claim is already in "${claim.status}" state and cannot be modified.`,
      );
    }
  }

  private async escalateToAdminReview(claimId: string, reason: string) {
    await this.prisma.companyOwnershipClaim.update({
      where: { id: claimId },
      data: { status: 'under_admin_review' },
    });
    this.logger.log(`Claim ${claimId} escalated to admin review: ${reason}`);
  }

  private async approveClaim(
    claim: any,
    userId: string,
    method: string,
    adminId?: string,
    adminNotes?: string,
    grantRole?: string,
  ) {
    const roleToGrant = (grantRole ?? claim.requestedRole ?? 'owner') as any;

    // 1. Update claim
    await this.prisma.companyOwnershipClaim.update({
      where: { id: claim.id },
      data: {
        status: 'approved',
        verificationMethod: method as any,
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

    // 2. Upsert CompanyRole
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

    // 3. If owner/founder — update company.ownerId and grant system-level role
    if (roleToGrant === 'owner' || roleToGrant === 'founder') {
      // Downgrade previous owner to founder in CompanyRole (if different user)
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

      // Update company.ownerId
      await this.prisma.company.update({
        where: { id: claim.companyId },
        data: { ownerId: userId },
      });

      // Grant system-level company_owner role
      await this.prisma.userRole.upsert({
        where: { userId_role: { userId, role: 'company_owner' } },
        update: {},
        create: { userId, role: 'company_owner' },
      });
    }

    // 4. Withdraw all other pending claims for the same company
    await this.prisma.companyOwnershipClaim.updateMany({
      where: {
        companyId: claim.companyId,
        id: { not: claim.id },
        status: { notIn: ['approved', 'rejected', 'withdrawn'] },
      },
      data: { status: 'withdrawn' },
    });

    this.logger.log(
      `Claim ${claim.id} approved. User ${userId} granted "${roleToGrant}" on company ${claim.companyId}`,
    );

    return {
      status: 'approved',
      role: roleToGrant,
      companyId: claim.companyId,
      message: `Ownership claim approved. You have been granted the "${roleToGrant}" role.`,
    };
  }
}
