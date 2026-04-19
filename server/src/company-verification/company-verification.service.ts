import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiVerificationService } from './ai-verification.service';

const MANUAL_REVIEW_SLA_HOURS = Number(
  process.env.COMPANY_VERIFICATION_MANUAL_REVIEW_SLA_HOURS || 24,
);

@Injectable()
export class CompanyVerificationService {
  private readonly logger = new Logger(CompanyVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiVerification: AiVerificationService,
  ) {}

  // ─── Start Verification ──────────────────────────────────────────────────────

  async startVerification(
    companyId: string,
    userId: string,
    gstin: string,
    cinNumber?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId)
      throw new ForbiddenException('Only the owner can start verification');

    if (company.verificationStatus === 'verified') {
      throw new BadRequestException('Company is already verified');
    }

    if (company.verificationStatus === 'rejected') {
      throw new BadRequestException(
        'Company verification was rejected. Please contact support to appeal.',
      );
    }

    // Persist GSTIN and CIN on the Company record
    await this.prisma.company.update({
      where: { id: companyId },
      data: { gstin, cinNumber: cinNumber ?? company.cinNumber },
    });

    // Create a new verification session
    const session = await this.prisma.companyVerificationSession.create({
      data: {
        companyId,
        userId,
        status: 'pending',
        gstin,
        cinNumber: cinNumber ?? null,
      },
    });

    this.logger.log(
      `Company verification session ${session.id} started for company ${companyId}`,
    );

    return session;
  }

  // ─── Submit Legal Documents ───────────────────────────────────────────────────

  async submitDocument(
    sessionId: string,
    userId: string,
    documentType: string,
    fileUrl: string,
    incorporationCertUrl?: string,
  ) {
    const session = await this.getSession(sessionId, userId);

    if (session.status !== 'pending') {
      throw new BadRequestException(
        'Documents can only be uploaded when the session is in "pending" state',
      );
    }

    // Persist document URLs on the Company record
    await this.prisma.company.update({
      where: { id: session.companyId },
      data: {
        registrationDocumentUrl: fileUrl,
        ...(incorporationCertUrl ? { incorporationCertUrl } : {}),
      },
    });

    // Update session
    return this.prisma.companyVerificationSession.update({
      where: { id: sessionId },
      data: {
        documentType,
        status: 'document_uploaded',
        registrationDocumentUrl: fileUrl,
        incorporationCertUrl: incorporationCertUrl ?? null,
        documentValid: true, // will be assessed by AI
      },
    });
  }

  // ─── AI Verification ─────────────────────────────────────────────────────────

  async runAiVerification(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId);

    if (session.status !== 'document_uploaded') {
      throw new BadRequestException(
        'Please upload your legal documents before submitting for verification',
      );
    }

    // Fetch full company details
    const company = await this.prisma.company.findUnique({
      where: { id: session.companyId },
    });

    if (!company) throw new NotFoundException('Company not found');

    // Validate that GSTIN was submitted
    if (!session.gstin) {
      throw new BadRequestException(
        'GSTIN is missing from the verification session. Please restart verification with your GSTIN.',
      );
    }

    // Mark session as processing
    await this.prisma.companyVerificationSession.update({
      where: { id: sessionId },
      data: { status: 'processing' },
    });

    this.logger.log(`Running AI verification for session ${sessionId}`);

    // Call AI model
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

    this.logger.log(
      `AI verdict for session ${sessionId}: ${aiResult.verdict} (confidence: ${aiResult.confidence})`,
    );

    // Map AI verdict to VerificationStatus
    let sessionStatus: string;
    let companyStatus: 'verified' | 'rejected' | 'pending';
    let failureReason: string | null = null;

    if (aiResult.verdict === 'approved') {
      sessionStatus = 'passed';
      companyStatus = 'verified';
    } else if (aiResult.verdict === 'manual_review') {
      sessionStatus = 'manual_review';
      companyStatus = 'pending';
    } else {
      sessionStatus = 'failed';
      companyStatus = 'rejected';
      failureReason = aiResult.reason;
    }

    // Update session
    const updatedSession = await this.prisma.companyVerificationSession.update({
      where: { id: sessionId },
      data: {
        status: sessionStatus as any,
        apiValidationSuccessful: aiResult.verdict !== 'rejected',
        documentValid: aiResult.verdict !== 'rejected',
        aiVerificationReason: aiResult.reason,
        aiConfidenceScore: aiResult.confidence,
        failureReason,
      },
    });

    // Update company status
    await this.prisma.company.update({
      where: { id: session.companyId },
      data: {
        verificationStatus: companyStatus,
        ...(companyStatus === 'verified' ? { verifiedAt: new Date() } : {}),
      },
    });

    // If manual_review, create a ManualReview record for admin visibility
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

  // ─── Status ───────────────────────────────────────────────────────────────────

  async getSessionStatus(sessionId: string, userId: string) {
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

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.companyVerificationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Verification session not found');
    if (session.userId !== userId)
      throw new ForbiddenException('Access denied – this is not your session');

    return session;
  }
}
