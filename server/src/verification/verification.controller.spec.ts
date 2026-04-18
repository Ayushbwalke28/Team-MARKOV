import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { BadRequestException } from '@nestjs/common';
import { DocumentTypeEnum } from './dto/start-verification.dto';

describe('VerificationController', () => {
  let controller: VerificationController;
  let service: any;

  beforeEach(async () => {
    service = {
      startSession: jest.fn().mockResolvedValue({ id: 'sess-1' }),
      recordConsent: jest.fn().mockResolvedValue({}),
      uploadDocument: jest.fn().mockResolvedValue({ ocrData: {} }),
      captureFace: jest.fn().mockResolvedValue({ result: { status: 'passed' } }),
      getSessionStatus: jest.fn().mockResolvedValue({ status: 'pending' }),
      getUserVerificationStatus: jest.fn().mockResolvedValue({ status: 'passed' }),
      deleteUserData: jest.fn().mockResolvedValue({ message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [{ provide: VerificationService, useValue: service }],
    }).compile();

    controller = module.get<VerificationController>(VerificationController);
  });

  describe('startSession', () => {
    it('should call service.startSession', async () => {
      const result = await controller.startSession({ user: { userId: 'user-1' } });
      expect(service.startSession).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ id: 'sess-1' });
    });
  });

  describe('recordConsent', () => {
    it('should throw if consent is false', async () => {
      await expect(
        controller.recordConsent({ user: { userId: 'user-1' } }, 'sess-1', { consent: false }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service if consent is true', async () => {
      await controller.recordConsent({ user: { userId: 'user-1' } }, 'sess-1', { consent: true });
      expect(service.recordConsent).toHaveBeenCalledWith('sess-1', 'user-1');
    });
  });

  describe('uploadDocument', () => {
    it('should throw if front image is missing', async () => {
      await expect(
        controller.uploadDocument(
          { user: { userId: 'user-1' } },
          'sess-1',
          { documentType: DocumentTypeEnum.aadhaar },
          { front: undefined },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw for invalid mime type', async () => {
      const mockFile = { mimetype: 'application/msword', buffer: Buffer.from('') } as any;
      await expect(
        controller.uploadDocument(
          { user: { userId: 'user-1' } },
          'sess-1',
          { documentType: DocumentTypeEnum.aadhaar },
          { front: [mockFile] },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service with buffers', async () => {
      const mockFront = { mimetype: 'image/jpeg', buffer: Buffer.from('front') } as any;
      const mockBack = { mimetype: 'image/png', buffer: Buffer.from('back') } as any;

      await controller.uploadDocument(
        { user: { userId: 'user-1' } },
        'sess-1',
        { documentType: DocumentTypeEnum.aadhaar },
        { front: [mockFront], back: [mockBack] },
      );

      expect(service.uploadDocument).toHaveBeenCalledWith(
        'sess-1',
        'user-1',
        DocumentTypeEnum.aadhaar,
        Buffer.from('front'),
        Buffer.from('back'),
      );
    });
  });

  describe('captureFace', () => {
    it('should throw if selfie is missing', async () => {
      await expect(
        controller.captureFace({ user: { userId: 'user-1' } }, 'sess-1', undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service with buffer', async () => {
      const mockFile = { mimetype: 'image/jpeg', buffer: Buffer.from('selfie') } as any;

      await controller.captureFace({ user: { userId: 'user-1' } }, 'sess-1', mockFile);

      expect(service.captureFace).toHaveBeenCalledWith('sess-1', 'user-1', Buffer.from('selfie'));
    });
  });

  describe('deleteVerificationData', () => {
    it('should call service', async () => {
      await controller.deleteVerificationData({ user: { userId: 'user-1' } });
      expect(service.deleteUserData).toHaveBeenCalledWith('user-1');
    });
  });
});
