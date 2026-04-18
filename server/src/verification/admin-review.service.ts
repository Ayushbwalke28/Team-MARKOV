import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationEventsService } from './verification-events.service';

@Injectable()
export class AdminReviewService {
  private readonly logger = new Logger(AdminReviewService.name);

  constructor(
    private prisma: PrismaService,
    private events: VerificationEventsService,
  ) {}

  async getQueue(filters: { status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status === 'pending') {
      where.reviewDecision = null;
    } else if (filters.status === 'reviewed') {
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

  async getReviewDetail(reviewId: string) {
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

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async submitDecision(
    reviewId: string,
    adminId: string,
    decision: 'approved' | 'rejected',
    notes?: string,
  ) {
    const review = await this.prisma.manualReview.findUnique({
      where: { id: reviewId },
      include: { verificationSession: true },
    });

    if (!review) throw new NotFoundException('Review not found');

    // Update review
    const updatedReview = await this.prisma.manualReview.update({
      where: { id: reviewId },
      data: {
        reviewedBy: adminId,
        reviewDecision: decision,
        reviewNotes: notes || null,
        reviewedAt: new Date(),
      },
    });

    // Update verification session status
    const newStatus = decision === 'approved' ? 'passed' : 'failed';
    await this.prisma.verificationSession.update({
      where: { id: review.verificationSessionId },
      data: {
        status: newStatus as any,
        failureReason: decision === 'rejected'
          ? `Manually rejected: ${notes || 'No reason provided'}`
          : null,
      },
    });

    // If approved, verify the user
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
    } else {
      this.events.emit('verification.failed', {
        sessionId: review.verificationSessionId,
        userId: review.verificationSession.userId,
        status: 'failed',
        reason: `Manually rejected: ${notes || 'No reason provided'}`,
      });
    }

    return updatedReview;
  }

  async getAuditLog(filters: { page?: number; limit?: number }) {
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
}
