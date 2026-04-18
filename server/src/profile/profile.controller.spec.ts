import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;

  const mockProfileService = {
    getMe: jest.fn(),
    updateMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── GET /profile/me ──────────────────────────────────────────────────────

  describe('me (GET /profile/me)', () => {
    it('should return profile data for the authenticated user', async () => {
      const mockReq = { user: { userId: 'user-abc' } };
      const mockResult = {
        user: { id: 'user-abc', email: 'test@example.com', name: 'Alice', roles: ['candidate'], verified: true },
        profile: { userId: 'user-abc', fullName: 'Alice', education: [], experience: [], certificates: [] },
      };

      mockProfileService.getMe.mockResolvedValue(mockResult);

      const result = await controller.me(mockReq);

      expect(profileService.getMe).toHaveBeenCalledWith('user-abc');
      expect(result).toBe(mockResult);
    });

    it('should propagate errors thrown by ProfileService', async () => {
      const mockReq = { user: { userId: 'nonexistent' } };
      mockProfileService.getMe.mockRejectedValue(new Error('User not found'));

      await expect(controller.me(mockReq)).rejects.toThrow('User not found');
      expect(profileService.getMe).toHaveBeenCalledWith('nonexistent');
    });

    it('should use userId from req.user, not the user object itself', async () => {
      const mockReq = { user: { userId: 'specific-id', email: 'should-not-use@example.com' } };
      mockProfileService.getMe.mockResolvedValue({});

      await controller.me(mockReq);

      // Must extract only userId
      expect(profileService.getMe).toHaveBeenCalledWith('specific-id');
      expect(profileService.getMe).not.toHaveBeenCalledWith(mockReq.user);
    });
  });

  // ── PATCH /profile/me ────────────────────────────────────────────────────

  describe('updateMe (PATCH /profile/me)', () => {
    it('should update the profile and return the result', async () => {
      const mockReq = { user: { userId: 'user-xyz' } };
      const dto: UpdateProfileDto = {
        fullName: 'Updated Name',
        about: 'A developer',
      };
      const mockResult = { userId: 'user-xyz', fullName: 'Updated Name', about: 'A developer' };

      mockProfileService.updateMe.mockResolvedValue(mockResult);

      const result = await controller.updateMe(mockReq, dto);

      expect(profileService.updateMe).toHaveBeenCalledWith('user-xyz', dto);
      expect(result).toBe(mockResult);
    });

    it('should pass the entire DTO unmodified to ProfileService', async () => {
      const mockReq = { user: { userId: 'user-dto-test' } };
      const dto: UpdateProfileDto = {
        fullName: 'Alice',
        education: [{ institution: 'MIT', degree: 'BSc' }],
        experience: [{ title: 'Engineer', company: 'ACME' }],
        certificates: [{ title: 'AWS Pro', issuer: 'Amazon' }],
      };

      mockProfileService.updateMe.mockResolvedValue({});

      await controller.updateMe(mockReq, dto);

      expect(profileService.updateMe).toHaveBeenCalledWith('user-dto-test', dto);
    });

    it('should propagate service errors on update', async () => {
      const mockReq = { user: { userId: 'bad-user' } };
      mockProfileService.updateMe.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateMe(mockReq, {})).rejects.toThrow('Update failed');
    });
  });
});
