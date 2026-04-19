import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipClaimController } from './ownership-claim.controller';
import { OwnershipClaimService } from './ownership-claim.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('OwnershipClaimController', () => {
  let controller: OwnershipClaimController;

  const mockOwnershipClaimService = {
    createClaim: jest.fn(),
    getMyClaims: jest.fn(),
    getClaimDetail: jest.fn(),
    withdrawClaim: jest.fn(),
    sendDomainOtp: jest.fn(),
    verifyDomainOtp: jest.fn(),
    uploadDocuments: jest.fn(),
    validateGstin: jest.fn(),
    requestAdminReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnershipClaimController],
      providers: [
        {
          provide: OwnershipClaimService,
          useValue: mockOwnershipClaimService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OwnershipClaimController>(OwnershipClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
