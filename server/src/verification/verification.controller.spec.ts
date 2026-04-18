import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { SetVerificationDto } from './dto/set-verification.dto';

describe('VerificationController', () => {
  let controller: VerificationController;
  let verificationService: jest.Mocked<VerificationService>;

  const mockVerificationService = { setVerified: jest.fn() };

  const baseUser = {
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice',
    verified: true,
    roles: [{ role: 'candidate' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [{ provide: VerificationService, useValue: mockVerificationService }],
    }).compile();

    controller = module.get<VerificationController>(VerificationController);
    verificationService = module.get(VerificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setMe (PATCH /verification/me)', () => {
    it('should verify a user and return shaped response', async () => {
      const req = { user: { userId: 'user-1' } };
      const dto: SetVerificationDto = { verified: true };
      mockVerificationService.setVerified.mockResolvedValue(baseUser);

      const result = await controller.setMe(req, dto);

      expect(verificationService.setVerified).toHaveBeenCalledWith('user-1', true);
      expect(result).toEqual({
        user: { id: 'user-1', email: 'alice@example.com', name: 'Alice', roles: ['candidate'], verified: true },
      });
    });

    it('should revoke verification (verified=false)', async () => {
      const req = { user: { userId: 'user-1' } };
      const dto: SetVerificationDto = { verified: false };
      mockVerificationService.setVerified.mockResolvedValue({ ...baseUser, verified: false });

      const result = await controller.setMe(req, dto);

      expect(result.user.verified).toBe(false);
    });

    it('should map all roles to flat role strings', async () => {
      const req = { user: { userId: 'user-2' } };
      const dto: SetVerificationDto = { verified: true };
      mockVerificationService.setVerified.mockResolvedValue({
        ...baseUser,
        roles: [{ role: 'candidate' }, { role: 'company_owner' }],
      });

      const result = await controller.setMe(req, dto);

      expect(result.user.roles).toEqual(['candidate', 'company_owner']);
    });

    it('should handle empty roles array', async () => {
      const req = { user: { userId: 'user-3' } };
      const dto: SetVerificationDto = { verified: true };
      mockVerificationService.setVerified.mockResolvedValue({ ...baseUser, roles: [] });

      const result = await controller.setMe(req, dto);

      expect(result.user.roles).toEqual([]);
    });

    it('should propagate service errors', async () => {
      const req = { user: { userId: 'bad' } };
      mockVerificationService.setVerified.mockRejectedValue(new Error('DB error'));

      await expect(controller.setMe(req, { verified: true })).rejects.toThrow('DB error');
    });

    it('should call setVerified exactly once per request', async () => {
      const req = { user: { userId: 'user-once' } };
      mockVerificationService.setVerified.mockResolvedValue(baseUser);

      await controller.setMe(req, { verified: true });

      expect(verificationService.setVerified).toHaveBeenCalledTimes(1);
    });
  });
});
