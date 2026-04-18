import { Test, TestingModule } from '@nestjs/testing';
import { CompanyVerificationController } from './company-verification.controller';

describe('CompanyVerificationController', () => {
  let controller: CompanyVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyVerificationController],
    }).compile();

    controller = module.get<CompanyVerificationController>(CompanyVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
