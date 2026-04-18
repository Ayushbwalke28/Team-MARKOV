import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';

// ─── Prisma Mock Factory ──────────────────────────────────────────────────────

function makePrismaMock() {
  const users = new Map<string, any>();
  const profiles = new Map<string, any>();

  return {
    _users: users,
    _profiles: profiles,

    user: {
      findUnique: jest.fn(async ({ where, include }: any) => {
        const user = users.get(where.id);
        if (!user) return null;
        const out: any = { ...user };
        if (include?.roles) out.roles = user.roles ?? [];
        if (include?.profile) {
          const profile = profiles.get(where.id) ?? null;
          out.profile = profile
            ? {
                ...profile,
                education: profile.education ?? [],
                experience: profile.experience ?? [],
                certificates: profile.certificates ?? [],
              }
            : null;
        }
        return out;
      }),
    },

    userProfile: {
      upsert: jest.fn(async ({ where, create, update }: any) => {
        const existing = profiles.get(where.userId);
        if (existing) {
          const updated = { ...existing, ...update };
          profiles.set(where.userId, updated);
          return updated;
        }
        const created = { userId: where.userId, ...create };
        profiles.set(where.userId, created);
        return created;
      }),

      update: jest.fn(async ({ where, data, include }: any) => {
        const existing = profiles.get(where.userId);
        if (!existing) throw new Error('Profile not found');

        // Simulate deleteMany + create for nested relations
        const education =
          data.education?.create !== undefined
            ? data.education.create
            : existing.education ?? [];

        const experience =
          data.experience?.create !== undefined
            ? data.experience.create
            : existing.experience ?? [];

        const certificates =
          data.certificates?.create !== undefined
            ? data.certificates.create
            : existing.certificates ?? [];

        const updated = {
          ...existing,
          fullName: data.fullName ?? existing.fullName,
          about: data.about ?? existing.about,
          avatarUrl: data.avatarUrl ?? existing.avatarUrl,
          bannerUrl: data.bannerUrl ?? existing.bannerUrl,
          dob: data.dob ?? existing.dob,
          gender: data.gender ?? existing.gender,
          pronouns: data.pronouns ?? existing.pronouns,
          education,
          experience,
          certificates,
        };
        profiles.set(where.userId, updated);

        if (include) {
          return { ...updated };
        }
        return updated;
      }),
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seedUser(prismaMock: ReturnType<typeof makePrismaMock>, userId: string) {
  prismaMock._users.set(userId, {
    id: userId,
    email: `${userId}@example.com`,
    name: 'Test User',
    verified: false,
    roles: [{ role: 'candidate' }],
  });
  prismaMock._profiles.set(userId, {
    userId,
    fullName: 'Test User',
    about: null,
    avatarUrl: null,
    bannerUrl: null,
    dob: null,
    gender: null,
    pronouns: null,
    education: [],
    experience: [],
    certificates: [],
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaMock: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prismaMock = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── getMe ─────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('should return user + profile for an existing user', async () => {
      seedUser(prismaMock, 'user-1');

      const result = await service.getMe('user-1');

      expect(result.user).toMatchObject({
        id: 'user-1',
        email: 'user-1@example.com',
        name: 'Test User',
        roles: ['candidate'],
        verified: false,
      });
      expect(result.profile).toBeDefined();
      expect(result.profile?.education).toEqual([]);
      expect(result.profile?.experience).toEqual([]);
      expect(result.profile?.certificates).toEqual([]);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.getMe('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should call prisma.user.findUnique with correct args', async () => {
      seedUser(prismaMock, 'user-2');
      await service.getMe('user-2');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-2' },
        include: {
          roles: true,
          profile: {
            include: {
              education: true,
              experience: true,
              certificates: true,
            },
          },
        },
      });
    });
  });

  // ── updateMe ──────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    it('should update basic scalar profile fields', async () => {
      seedUser(prismaMock, 'user-3');

      const dto: UpdateProfileDto = {
        fullName: 'Updated Name',
        about: 'Software engineer',
        avatarUrl: 'https://example.com/avatar.png',
        pronouns: 'they/them',
        gender: 'non_binary',
      };

      const result = await service.updateMe('user-3', dto);

      expect(result.fullName).toBe('Updated Name');
      expect(result.about).toBe('Software engineer');
      expect(result.avatarUrl).toBe('https://example.com/avatar.png');
      expect(result.pronouns).toBe('they/them');
      expect(result.gender).toBe('non_binary');
    });

    it('should upsert profile before updating (idempotent for new users)', async () => {
      seedUser(prismaMock, 'user-4');

      await service.updateMe('user-4', { fullName: 'Hello' });

      expect(prismaMock.userProfile.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.userProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-4' } }),
      );
    });

    it('should replace all education entries when provided', async () => {
      seedUser(prismaMock, 'user-5');

      // Seed some existing education first
      prismaMock._profiles.get('user-5').education = [
        { institution: 'Old University', degree: 'BSc' },
      ];

      const dto: UpdateProfileDto = {
        education: [
          { institution: 'MIT', degree: 'MSc', fieldOfStudy: 'CS' },
          { institution: 'Stanford', degree: 'PhD', fieldOfStudy: 'AI' },
        ],
      };

      const result = await service.updateMe('user-5', dto);

      expect(result.education).toHaveLength(2);
      expect(result.education[0]).toMatchObject({ institution: 'MIT', degree: 'MSc' });
      expect(result.education[1]).toMatchObject({ institution: 'Stanford', degree: 'PhD' });
    });

    it('should replace all experience entries when provided', async () => {
      seedUser(prismaMock, 'user-6');

      const dto: UpdateProfileDto = {
        experience: [
          {
            title: 'Senior Engineer',
            company: 'Acme Corp',
            employmentType: 'full_time',
            isCurrent: true,
          },
        ],
      };

      const result = await service.updateMe('user-6', dto);

      expect(result.experience).toHaveLength(1);
      expect(result.experience[0]).toMatchObject({
        title: 'Senior Engineer',
        company: 'Acme Corp',
        isCurrent: true,
      });
    });

    it('should replace all certificate entries when provided', async () => {
      seedUser(prismaMock, 'user-7');

      const dto: UpdateProfileDto = {
        certificates: [
          {
            title: 'AWS Solutions Architect',
            issuer: 'Amazon',
            credentialId: 'AWS-123456',
            credentialUrl: 'https://aws.amazon.com/cert/123',
          },
        ],
      };

      const result = await service.updateMe('user-7', dto);

      expect(result.certificates).toHaveLength(1);
      expect(result.certificates[0]).toMatchObject({
        title: 'AWS Solutions Architect',
        issuer: 'Amazon',
        credentialId: 'AWS-123456',
      });
    });

    it('should not overwrite education/experience/certificates when not provided in dto', async () => {
      seedUser(prismaMock, 'user-8');
      prismaMock._profiles.get('user-8').education = [
        { institution: 'Existing Uni', degree: 'BSc' },
      ];

      // dto does NOT include education
      const dto: UpdateProfileDto = { fullName: 'Only Name Change' };
      const result = await service.updateMe('user-8', dto);

      // Education should remain untouched
      expect(result.education).toHaveLength(1);
      expect(result.education[0].institution).toBe('Existing Uni');
    });

    it('should handle simultaneous update of all sub-entities', async () => {
      seedUser(prismaMock, 'user-9');

      const dto: UpdateProfileDto = {
        fullName: 'Full Stack Dev',
        education: [{ institution: 'Harvard', degree: 'BA' }],
        experience: [{ title: 'Dev', company: 'FAANG' }],
        certificates: [{ title: 'GCP Pro', issuer: 'Google' }],
      };

      const result = await service.updateMe('user-9', dto);

      expect(result.fullName).toBe('Full Stack Dev');
      expect(result.education).toHaveLength(1);
      expect(result.experience).toHaveLength(1);
      expect(result.certificates).toHaveLength(1);
    });

    it('should clear all education when an empty array is provided', async () => {
      seedUser(prismaMock, 'user-10');
      prismaMock._profiles.get('user-10').education = [
        { institution: 'Some Uni', degree: 'BSc' },
      ];

      const dto: UpdateProfileDto = { education: [] };
      const result = await service.updateMe('user-10', dto);

      expect(result.education).toHaveLength(0);
    });
  });
});
