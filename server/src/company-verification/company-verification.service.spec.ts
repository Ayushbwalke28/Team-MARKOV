import { Test, TestingModule } from '@nestjs/testing';
import { CompanyVerificationService } from './company-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiVerificationService } from './ai-verification.service';

describe('CompanyVerificationService', () => {
  let service: CompanyVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyVerificationService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AiVerificationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CompanyVerificationService>(CompanyVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
