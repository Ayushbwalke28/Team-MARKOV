import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mock Factory ─────────────────────────────────────────────────────────────

function makePrismaMock() {
  const state = new Map<string, any>();

  return {
    _state: state,
    user: {
      update: jest.fn(async ({ where, data, select }: any) => {
        const existing = state.get(where.id);
        if (!existing) throw new Error(`User ${where.id} not found`);

        const updated = { ...existing, ...data };
        state.set(where.id, updated);

        // Simulate Prisma `select` projection
        if (select) {
          const projected: any = {};
          if (select.id) projected.id = updated.id;
          if (select.email) projected.email = updated.email;
          if (select.name) projected.name = updated.name;
          if (select.verified) projected.verified = updated.verified;
          if (select.roles) projected.roles = (updated.roles ?? []).map((r: any) => ({ role: r.role }));
          return projected;
        }
        return updated;
      }),
    },
  };
}

function seedUser(mock: ReturnType<typeof makePrismaMock>, userId: string, overrides: Partial<any> = {}) {
  mock._state.set(userId, {
    id: userId,
    email: `${userId}@example.com`,
    name: 'Test User',
    verified: false,
    roles: [{ role: 'candidate' }],
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('VerificationService', () => {
  let service: VerificationService;
  let prismaMock: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prismaMock = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('setVerified', () => {
    it('should set verified=true and return the projected user', async () => {
      seedUser(prismaMock, 'user-1');

      const result = await service.setVerified('user-1', true);

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('user-1@example.com');
      expect(result.name).toBe('Test User');
      expect(result.verified).toBe(true);
      expect(result.roles).toEqual([{ role: 'candidate' }]);
    });

    it('should set verified=false (revoke verification)', async () => {
      seedUser(prismaMock, 'user-2', { verified: true });

      const result = await service.setVerified('user-2', false);

      expect(result.verified).toBe(false);
    });

    it('should call prisma.user.update with correct arguments', async () => {
      seedUser(prismaMock, 'user-3');

      await service.setVerified('user-3', true);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-3' },
        data: { verified: true },
        select: {
          id: true,
          email: true,
          name: true,
          verified: true,
          roles: { select: { role: true } },
        },
      });
    });

    it('should call prisma.user.update exactly once per invocation', async () => {
      seedUser(prismaMock, 'user-4');

      await service.setVerified('user-4', true);
      await service.setVerified('user-4', false);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
    });

    it('should return a partial user shape matching the select projection', async () => {
      seedUser(prismaMock, 'user-5', { roles: [{ role: 'candidate' }, { role: 'company_owner' }] });

      const result = await service.setVerified('user-5', true);

      // Should only include selected fields
      expect(result).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
        verified: expect.any(Boolean),
        roles: expect.any(Array),
      });
    });

    it('should reflect all user roles in the returned roles array', async () => {
      seedUser(prismaMock, 'user-6', {
        roles: [{ role: 'candidate' }, { role: 'company_owner' }],
      });

      const result = await service.setVerified('user-6', true);

      expect(result.roles).toHaveLength(2);
      expect(result.roles.map((r: any) => r.role)).toEqual(
        expect.arrayContaining(['candidate', 'company_owner']),
      );
    });

    it('should propagate prisma errors if user does not exist', async () => {
      // User not seeded → prisma mock throws
      await expect(service.setVerified('nonexistent', true)).rejects.toThrow(
        'User nonexistent not found',
      );
    });
  });
});
