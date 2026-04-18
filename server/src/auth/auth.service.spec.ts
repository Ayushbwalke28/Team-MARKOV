import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const state = new Map<string, any>();

    const prismaMock = {
      user: {
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.email) {
            for (const u of state.values()) {
              if (u.email === where.email) return { ...u };
            }
            return null;
          }
          if (where.id) return state.get(where.id) ? { ...state.get(where.id) } : null;
          return null;
        }),
        create: jest.fn(async ({ data }: any) => {
          state.set(data.id, { ...data });
          return { ...data };
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const current = state.get(where.id);
          if (!current) throw new Error('not found');
          const updated = { ...current, ...data };
          state.set(where.id, updated);
          return { ...updated };
        }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test_access_secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
  });

  it('registers a new user and returns tokens', async () => {
    const res = await authService.register({
      email: 'a@example.com',
      name: 'Alice',
      password: 'Password123!',
    });

    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(res.user).toEqual({ id: expect.any(String), email: 'a@example.com', name: 'Alice' });

    const stored = await usersService.findOneByEmail('a@example.com');
    expect(stored).toBeDefined();
    expect(stored?.passwordHash).not.toEqual('Password123!');
    expect(stored?.refreshTokenHash).toBeTruthy();
  });

  it('rejects duplicate registration', async () => {
    await authService.register({
      email: 'dup@example.com',
      name: 'Dup',
      password: 'Password123!',
    });

    await expect(
      authService.register({
        email: 'dup@example.com',
        name: 'Dup2',
        password: 'Password123!',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('validates user credentials', async () => {
    await authService.register({
      email: 'login@example.com',
      name: 'Login',
      password: 'Password123!',
    });

    const ok = await authService.validateUser('login@example.com', 'Password123!');
    expect(ok).toMatchObject({ email: 'login@example.com', name: 'Login', id: expect.any(String) });

    const bad = await authService.validateUser('login@example.com', 'wrong');
    expect(bad).toBeNull();
  });

  it('refresh rotates refresh tokens (old token becomes invalid)', async () => {
    const first = await authService.register({
      email: 'r@example.com',
      name: 'Rotator',
      password: 'Password123!',
    });

    const me = await authService.me(first.user.id);
    expect(me.email).toBe('r@example.com');

    const second = await authService.refresh(first.user.id, { refreshToken: first.refreshToken });
    expect(second.refreshToken).not.toEqual(first.refreshToken);

    await expect(
      authService.refresh(first.user.id, { refreshToken: first.refreshToken }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('logout invalidates refresh token', async () => {
    const first = await authService.register({
      email: 'logout@example.com',
      name: 'Logout',
      password: 'Password123!',
    });

    await authService.logout(first.user.id);
    await expect(
      authService.refresh(first.user.id, { refreshToken: first.refreshToken }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('changePassword updates password and clears refresh token', async () => {
    const first = await authService.register({
      email: 'pw@example.com',
      name: 'PW',
      password: 'Password123!',
    });

    await expect(
      authService.changePassword(first.user.id, {
        currentPassword: 'wrong',
        newPassword: 'NewPassword123!',
      }),
    ).rejects.toMatchObject({ status: 401 });

    await authService.changePassword(first.user.id, {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword123!',
    });

    const oldValid = await authService.validateUser('pw@example.com', 'Password123!');
    expect(oldValid).toBeNull();

    const newValid = await authService.validateUser('pw@example.com', 'NewPassword123!');
    expect(newValid?.email).toBe('pw@example.com');

    await expect(
      authService.refresh(first.user.id, { refreshToken: first.refreshToken }),
    ).rejects.toMatchObject({ status: 401 });
  });
});

