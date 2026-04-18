import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from './ocr.service';
import { DocumentValidatorService } from './document-validator.service';
import { FaceService } from './face.service';
import { VerificationEventsService } from './verification-events.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('VerificationService', () => {
  let service: VerificationService;
  let prisma: any;
  let ocrService: any;
  let documentValidator: any;
  let faceService: any;
  let events: any;

  beforeEach(async () => {
    prisma = {
      verificationSession: {
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      manualReview: { create: jest.fn() },
      user: { update: jest.fn() },
    };

    ocrService = {
      extractText: jest.fn().mockResolvedValue('Mock OCR text'),
      parseDocument: jest.fn().mockReturnValue({
        name: 'John Doe',
        dob: '1990-06-15',
        idNumber: '123456789012',
        expiry: '2030-12-31',
        address: '123 Test St',
        rawText: 'Mock OCR text',
      }),
    };

    documentValidator = {
      validateDocument: jest.fn().mockResolvedValue({
        isValid: true,
        isExpired: false,
        isBlurry: false,
        isTampered: false,
        issues: [],
      }),
    };

    faceService = {
      analyzeLiveness: jest.fn().mockResolvedValue(true),
      compareFaces: jest.fn().mockResolvedValue({ match: true, similarity: 0.92 }),
    };

    events = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: OcrService, useValue: ocrService },
        { provide: DocumentValidatorService, useValue: documentValidator },
        { provide: FaceService, useValue: faceService },
        { provide: VerificationEventsService, useValue: events },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  describe('startSession', () => {
    it('should create a new session when under attempt limit', async () => {
      prisma.verificationSession.count.mockResolvedValue(0);
      prisma.verificationSession.findFirst.mockResolvedValue(null);
      prisma.verificationSession.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'pending',
        attemptNumber: 1,
        consentGiven: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.startSession('user-1');
      expect(result.id).toBe('session-1');
      expect(result.status).toBe('pending');
      expect(events.emit).toHaveBeenCalledWith('verification.started', expect.any(Object));
    });

    it('should throw ForbiddenException when max attempts exceeded', async () => {
      prisma.verificationSession.count.mockResolvedValue(3);
      prisma.verificationSession.findFirst.mockResolvedValue({
        id: 'session-old',
        status: 'failed',
      });
      prisma.verificationSession.update.mockResolvedValue({});

      await expect(service.startSession('user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return existing active session', async () => {
      const activeSession = {
        id: 'session-active',
        status: 'pending',
        userId: 'user-1',
        attemptNumber: 1,
        consentGiven: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.verificationSession.count.mockResolvedValue(1);
      prisma.verificationSession.findFirst.mockResolvedValue(activeSession);

      const result = await service.startSession('user-1');
      expect(result.id).toBe('session-active');
      expect(prisma.verificationSession.create).not.toHaveBeenCalled();
    });
  });

  describe('uploadDocument', () => {
    it('should reject if consent not given', async () => {
      prisma.verificationSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'pending',
        consentGiven: false,
      });

      const buffer = Buffer.from('fake-image');
      await expect(
        service.uploadDocument('session-1', 'user-1', 'aadhaar', buffer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process document and return OCR data', async () => {
      prisma.verificationSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'pending',
        consentGiven: true,
      });

      prisma.verificationSession.update.mockResolvedValue({
        id: 'session-1',
        status: 'document_uploaded',
        ocrName: 'John Doe',
        consentGiven: true,
        attemptNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const buffer = Buffer.from('fake-image');
      const result = await service.uploadDocument('session-1', 'user-1', 'aadhaar', buffer);

      expect(result.ocrData.name).toBe('John Doe');
      expect(result.validation.isValid).toBe(true);
      expect(ocrService.extractText).toHaveBeenCalled();
    });
  });

  describe('captureFace', () => {
    it('should reject if session not in document_uploaded state', async () => {
      prisma.verificationSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'pending',
      });

      const buffer = Buffer.from('fake-selfie');
      await expect(
        service.captureFace('session-1', 'user-1', buffer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass verification when score meets threshold', async () => {
      prisma.verificationSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'document_uploaded',
      });

      prisma.verificationSession.update.mockResolvedValue({
        id: 'session-1',
        status: 'passed',
        faceMatchScore: 0.92,
        livenessPass: true,
        confidenceScore: 0.92,
        consentGiven: true,
        attemptNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock the stored ID image buffer
      (service as any).idImageBuffers.set('session-1', Buffer.from('fake-id'));

      const buffer = Buffer.from('fake-selfie');
      const result = await service.captureFace('session-1', 'user-1', buffer);

      expect(result.result.status).toBe('passed');
      expect(result.result.livenessPass).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { verified: true },
      });
      expect(events.emit).toHaveBeenCalledWith('verification.passed', expect.any(Object));
    });

    it('should flag for manual review when score is borderline', async () => {
      faceService.compareFaces.mockResolvedValue({ match: false, similarity: 0.75 });

      prisma.verificationSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        status: 'document_uploaded',
      });

      prisma.verificationSession.update.mockResolvedValue({
        id: 'session-1',
        status: 'manual_review',
        faceMatchScore: 0.75,
        livenessPass: true,
        confidenceScore: 0.75,
        consentGiven: true,
        attemptNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock the stored ID image buffer
      (service as any).idImageBuffers.set('session-1', Buffer.from('fake-id'));

      const buffer = Buffer.from('fake-selfie');
      const result = await service.captureFace('session-1', 'user-1', buffer);

      expect(result.result.status).toBe('manual_review');
      expect(prisma.manualReview.create).toHaveBeenCalled();
      expect(events.emit).toHaveBeenCalledWith('verification.manual_review', expect.any(Object));
    });
  });

  describe('deleteUserData', () => {
    it('should clear OCR data from all sessions', async () => {
      prisma.verificationSession.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteUserData('user-1');
      expect(result.message).toBe('Verification data has been deleted');
      expect(prisma.verificationSession.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          ocrName: null,
          ocrDob: null,
          ocrIdNumber: null,
          ocrExpiry: null,
          ocrAddress: null,
        }),
      });
    });
  });
});
