import { Test, TestingModule } from '@nestjs/testing';
import { AdminReviewService } from './admin-review.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationEventsService } from './verification-events.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminReviewService', () => {
  let service: AdminReviewService;
  let prisma: any;
  let events: any;

  beforeEach(async () => {
    prisma = {
      manualReview: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      verificationSession: {
        update: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
    };

    events = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminReviewService,
        { provide: PrismaService, useValue: prisma },
        { provide: VerificationEventsService, useValue: events },
      ],
    }).compile();

    service = module.get<AdminReviewService>(AdminReviewService);
  });

  describe('getQueue', () => {
    it('should return paginated queue items', async () => {
      const mockItems = [
        { id: 'rev-1', reason: 'Low confidence', verificationSession: { id: 'sess-1' } },
      ];
      prisma.manualReview.findMany.mockResolvedValue(mockItems);
      prisma.manualReview.count.mockResolvedValue(1);

      const result = await service.getQueue({ page: 1 });
      expect(result.items).toEqual(mockItems);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by pending status', async () => {
      prisma.manualReview.findMany.mockResolvedValue([]);
      prisma.manualReview.count.mockResolvedValue(0);

      await service.getQueue({ status: 'pending' });
      expect(prisma.manualReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reviewDecision: null },
        }),
      );
    });
  });

  describe('getReviewDetail', () => {
    it('should return review details', async () => {
      const mockReview = { id: 'rev-1', reason: 'Low confidence' };
      prisma.manualReview.findUnique.mockResolvedValue(mockReview);

      const result = await service.getReviewDetail('rev-1');
      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException for missing review', async () => {
      prisma.manualReview.findUnique.mockResolvedValue(null);
      await expect(service.getReviewDetail('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitDecision', () => {
    it('should approve a review and verify user', async () => {
      prisma.manualReview.findUnique.mockResolvedValue({
        id: 'rev-1',
        verificationSessionId: 'sess-1',
        verificationSession: { userId: 'user-1' },
      });
      prisma.manualReview.update.mockResolvedValue({ id: 'rev-1', reviewDecision: 'approved' });
      prisma.verificationSession.update.mockResolvedValue({});
      prisma.user.update.mockResolvedValue({});

      const result = await service.submitDecision('rev-1', 'admin-1', 'approved', 'Looks good');

      expect(result.reviewDecision).toBe('approved');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { verified: true },
      });
      expect(events.emit).toHaveBeenCalledWith('verification.passed', expect.any(Object));
    });

    it('should reject a review', async () => {
      prisma.manualReview.findUnique.mockResolvedValue({
        id: 'rev-1',
        verificationSessionId: 'sess-1',
        verificationSession: { userId: 'user-1' },
      });
      prisma.manualReview.update.mockResolvedValue({ id: 'rev-1', reviewDecision: 'rejected' });
      prisma.verificationSession.update.mockResolvedValue({});

      const result = await service.submitDecision('rev-1', 'admin-1', 'rejected', 'Suspicious');

      expect(result.reviewDecision).toBe('rejected');
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(events.emit).toHaveBeenCalledWith('verification.failed', expect.any(Object));
    });

    it('should throw NotFoundException for missing review', async () => {
      prisma.manualReview.findUnique.mockResolvedValue(null);
      await expect(
        service.submitDecision('nonexistent', 'admin-1', 'approved'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditLog', () => {
    it('should return paginated audit entries', async () => {
      prisma.manualReview.findMany.mockResolvedValue([]);
      prisma.manualReview.count.mockResolvedValue(0);

      const result = await service.getAuditLog({ page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.items).toEqual([]);
    });
  });
});
