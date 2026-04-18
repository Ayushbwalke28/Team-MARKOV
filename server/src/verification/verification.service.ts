import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from './ocr.service';
import { DocumentValidatorService } from './document-validator.service';
import { FaceService } from './face.service';
import { VerificationEventsService } from './verification-events.service';

const MAX_ATTEMPTS = Number(process.env.VERIFICATION_MAX_ATTEMPTS || 3);
const FACE_MATCH_THRESHOLD = Number(process.env.VERIFICATION_FACE_MATCH_THRESHOLD || 0.85);
const FACE_REVIEW_THRESHOLD = Number(process.env.VERIFICATION_FACE_REVIEW_THRESHOLD || 0.70);
const MANUAL_REVIEW_SLA_HOURS = Number(process.env.VERIFICATION_MANUAL_REVIEW_SLA_HOURS || 24);

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  // Temporary in-memory store for ID image buffers during a session
  private idImageBuffers = new Map<string, Buffer>();

  constructor(
    private prisma: PrismaService,
    private ocrService: OcrService,
    private documentValidator: DocumentValidatorService,
    private faceService: FaceService,
    private events: VerificationEventsService,
  ) {}

  async startSession(userId: string) {
    // Check attempt limit
    const attemptCount = await this.prisma.verificationSession.count({
      where: { userId },
    });

    if (attemptCount >= MAX_ATTEMPTS) {
      // Lock the user
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
      throw new ForbiddenException(
        'Maximum verification attempts exceeded. Please contact support.',
      );
    }

    // Check no active session
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

  async recordConsent(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId);
    return this.prisma.verificationSession.update({
      where: { id: session.id },
      data: { consentGiven: true, consentTimestamp: new Date() },
    });
  }

  async uploadDocument(
    sessionId: string,
    userId: string,
    documentType: string,
    frontBuffer: Buffer,
    backBuffer?: Buffer,
  ) {
    const session = await this.getSession(sessionId, userId);

    if (!session.consentGiven) {
      throw new BadRequestException('User consent is required before uploading documents');
    }

    if (!['pending'].includes(session.status)) {
      throw new BadRequestException('Document can only be uploaded in pending state');
    }

    // Run OCR on front image
    const rawText = await this.ocrService.extractText(frontBuffer);
    const parsed = this.ocrService.parseDocument(rawText, documentType);

    // If back image provided, merge OCR results
    if (backBuffer) {
      const backText = await this.ocrService.extractText(backBuffer);
      const backParsed = this.ocrService.parseDocument(backText, documentType);
      if (!parsed.address && backParsed.address) parsed.address = backParsed.address;
      if (!parsed.name && backParsed.name) parsed.name = backParsed.name;
    }

    // Validate document
    const validation = await this.documentValidator.validateDocument(
      parsed,
      frontBuffer,
      documentType,
    );

    // Store ID image buffer temporarily for face comparison
    this.idImageBuffers.set(sessionId, frontBuffer);

    // Update session
    const updated = await this.prisma.verificationSession.update({
      where: { id: session.id },
      data: {
        status: validation.isValid ? 'document_uploaded' : 'failed',
        documentType: documentType as any,
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

  async captureFace(sessionId: string, userId: string, selfieBuffer: Buffer) {
    const session = await this.getSession(sessionId, userId);

    if (session.status !== 'document_uploaded') {
      throw new BadRequestException('Document must be uploaded before face capture');
    }

    // Update to processing
    await this.prisma.verificationSession.update({
      where: { id: session.id },
      data: { status: 'processing' },
    });

    // Analyze liveness
    const livenessPass = await this.faceService.analyzeLiveness(selfieBuffer);

    // Compare faces
    const idImageBuffer = this.idImageBuffers.get(sessionId);
    let faceMatchScore = 0;

    if (idImageBuffer) {
      const comparison = await this.faceService.compareFaces(idImageBuffer, selfieBuffer);
      faceMatchScore = comparison.similarity;
    }

    // Clean up stored buffer
    this.idImageBuffers.delete(sessionId);

    // Determine final status
    const confidenceScore = livenessPass
      ? faceMatchScore
      : faceMatchScore * 0.5; // Penalize failed liveness

    let status: string;
    let failureReason: string | null = null;

    if (!livenessPass) {
      status = 'failed';
      failureReason = 'Liveness check failed — possible spoofing detected';
    } else if (confidenceScore >= FACE_MATCH_THRESHOLD) {
      status = 'passed';
    } else if (confidenceScore >= FACE_REVIEW_THRESHOLD) {
      status = 'manual_review';
    } else {
      status = 'failed';
      failureReason = 'Face does not match the document photo';
    }

    const updated = await this.prisma.verificationSession.update({
      where: { id: session.id },
      data: {
        status: status as any,
        faceMatchScore,
        livenessPass,
        confidenceScore,
        failureReason,
      },
    });

    // If passed, update user's verified flag
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
    } else if (status === 'manual_review') {
      // Create manual review entry
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
    } else {
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

  async getSessionStatus(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId);
    return this.formatSession(session);
  }

  async getUserVerificationStatus(userId: string) {
    const session = await this.prisma.verificationSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) return null;
    return this.formatSession(session);
  }

  async deleteUserData(userId: string) {
    // Clear OCR data from all sessions
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

  private async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.verificationSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Verification session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    return session;
  }

  private formatSession(session: any) {
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

  private maskIdNumber(idNumber: string): string {
    if (idNumber.length <= 4) return '****';
    return '*'.repeat(idNumber.length - 4) + idNumber.slice(-4);
  }
}
