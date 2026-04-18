import { UsersService } from './users.service';

describe('UsersService', () => {
  it('creates and retrieves users by email/id', async () => {
    const prisma = {
      user: {
        create: jest.fn(async ({ data }: any) => data),
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.email === 'a@example.com') return { id: 'u1', email: 'a@example.com' };
          if (where.id === 'u1') return { id: 'u1', email: 'a@example.com' };
          return null;
        }),
        update: jest.fn(async ({ where, data }: any) => ({ ...where, ...data })),
      },
    } as any;

    const users = new UsersService(prisma);
    const now = new Date();

    await users.create({
      id: 'u1',
      email: 'a@example.com',
      name: 'Alice',
      passwordHash: 'x',
      refreshTokenHash: null,
      createdAt: now,
      updatedAt: now,
    });

    expect(await users.findOneByEmail('a@example.com')).toMatchObject({ id: 'u1' });
    expect(await users.findById('u1')).toMatchObject({ email: 'a@example.com' });
  });

  it('stores refreshTokenHash and passwordHash updates', async () => {
    const state: any = {
      id: 'u1',
      email: 'a@example.com',
      name: 'Alice',
      passwordHash: 'old',
      refreshTokenHash: null,
    };

    const prisma = {
      user: {
        create: jest.fn(async ({ data }: any) => ({ ...data })),
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.id === 'u1') return { ...state };
          if (where.email === 'a@example.com') return { ...state };
          return null;
        }),
        update: jest.fn(async ({ data }: any) => {
          Object.assign(state, data);
          return { ...state };
        }),
      },
    } as any;

    const users = new UsersService(prisma);
    const now = new Date();

    await users.create({
      id: 'u1',
      email: 'a@example.com',
      name: 'Alice',
      passwordHash: 'old',
      refreshTokenHash: null,
      createdAt: now,
      updatedAt: now,
    });

    await users.setRefreshTokenHash('u1', 'rt');
    expect((await users.findById('u1'))?.refreshTokenHash).toBe('rt');

    await users.setPasswordHash('u1', 'new');
    expect((await users.findById('u1'))?.passwordHash).toBe('new');
  });
});

