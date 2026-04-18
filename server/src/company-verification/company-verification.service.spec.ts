import { Test, TestingModule } from '@nestjs/testing';
import { CompanyVerificationService } from './company-verification.service';

describe('CompanyVerificationService', () => {
  let service: CompanyVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyVerificationService],
    }).compile();

    service = module.get<CompanyVerificationService>(CompanyVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
