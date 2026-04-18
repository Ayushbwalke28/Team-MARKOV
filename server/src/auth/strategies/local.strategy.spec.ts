import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = { validateUser: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user when credentials are valid', async () => {
      const publicUser = { id: '1', email: 'test@example.com', name: 'Alice', roles: ['candidate'], verified: false };
      mockAuthService.validateUser.mockResolvedValue(publicUser);

      const result = await strategy.validate('test@example.com', 'password123');

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toBe(publicUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('bad@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with descriptive message on failure', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('x@x.com', 'y')).rejects.toThrow('Invalid email or password');
    });

    it('should call validateUser exactly once per invocation', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);
      try { await strategy.validate('a@b.com', 'p'); } catch {}

      expect(authService.validateUser).toHaveBeenCalledTimes(1);
    });
  });
});
