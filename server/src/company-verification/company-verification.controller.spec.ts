import { Test, TestingModule } from '@nestjs/testing';
import { CompanyVerificationController } from './company-verification.controller';
import { CompanyVerificationService } from './company-verification.service';

describe('CompanyVerificationController', () => {
  let controller: CompanyVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyVerificationController],
      providers: [
        {
          provide: CompanyVerificationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CompanyVerificationController>(CompanyVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
