import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipClaimService } from './ownership-claim.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiVerificationService } from '../company-verification/ai-verification.service';
import { DomainEmailVerificationService } from './domain-email-verification.service';
import { GstCrosscheckService } from './gst-crosscheck.service';

describe('OwnershipClaimService', () => {
  let service: OwnershipClaimService;

  const mockPrismaService = {};
  const mockAiVerificationService = {};
  const mockDomainEmailVerificationService = {};
  const mockGstCrosscheckService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipClaimService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AiVerificationService, useValue: mockAiVerificationService },
        { provide: DomainEmailVerificationService, useValue: mockDomainEmailVerificationService },
        { provide: GstCrosscheckService, useValue: mockGstCrosscheckService },
      ],
    }).compile();

    service = module.get<OwnershipClaimService>(OwnershipClaimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
