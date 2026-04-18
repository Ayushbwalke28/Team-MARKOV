import { Test, TestingModule } from '@nestjs/testing';
import { AdminReviewController } from './admin-review.controller';
import { AdminReviewService } from './admin-review.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminReviewController', () => {
  let controller: AdminReviewController;
  let service: any;

  beforeEach(async () => {
    service = {
      getQueue: jest.fn().mockResolvedValue({ items: [] }),
      getReviewDetail: jest.fn().mockResolvedValue({ id: 'rev-1' }),
      submitDecision: jest.fn().mockResolvedValue({ reviewDecision: 'approved' }),
      getAuditLog: jest.fn().mockResolvedValue({ items: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminReviewController],
      providers: [
        { provide: AdminReviewService, useValue: service },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AdminReviewController>(AdminReviewController);
  });

  describe('getQueue', () => {
    it('should pass pagination params to service', async () => {
      await controller.getQueue('pending', '2', '10');
      expect(service.getQueue).toHaveBeenCalledWith({ status: 'pending', page: 2, limit: 10 });
    });
  });

  describe('getReviewDetail', () => {
    it('should call service with id', async () => {
      await controller.getReviewDetail('rev-1');
      expect(service.getReviewDetail).toHaveBeenCalledWith('rev-1');
    });
  });

  describe('submitDecision', () => {
    it('should pass decision and notes to service', async () => {
      await controller.submitDecision(
        { user: { userId: 'admin-1' } },
        'rev-1',
        { decision: 'approved' as any, notes: 'OK' },
      );
      expect(service.submitDecision).toHaveBeenCalledWith('rev-1', 'admin-1', 'approved', 'OK');
    });
  });

  describe('getAuditLog', () => {
    it('should pass pagination params to service', async () => {
      await controller.getAuditLog('1', '20');
      expect(service.getAuditLog).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
});
