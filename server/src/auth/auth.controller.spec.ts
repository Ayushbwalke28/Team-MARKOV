import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    refreshFromToken: jest.fn(),
    logoutFromRefreshToken: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and set cookies', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(dto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'access-token', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.any(Object));
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('login', () => {
    it('should login an existing user and set cookies', async () => {
      const req = { user: { email: 'test@example.com', id: '1' } } as any;
      const result = {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(result);

      const response = await controller.login(req, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(req.user);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'access-token', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.any(Object));
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('me', () => {
    it('should return current user information', async () => {
      const req = { user: { userId: '1' } } as any;
      const result = { id: '1', email: 'test@example.com' };

      mockAuthService.me.mockResolvedValue(result);

      const response = await controller.me(req);

      expect(authService.me).toHaveBeenCalledWith(req.user.userId);
      expect(response).toEqual(result);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookies', async () => {
      const req = { cookies: { refresh_token: 'old-refresh-token' } } as any;
      const result = {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshFromToken.mockResolvedValue(result);

      const response = await controller.refresh(req, mockResponse);

      expect(authService.refreshFromToken).toHaveBeenCalledWith('old-refresh-token');
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'new-access-token', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'new-refresh-token', expect.any(Object));
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookies', async () => {
      const req = { cookies: { refresh_token: 'refresh-token' } } as any;

      mockAuthService.logoutFromRefreshToken.mockResolvedValue(undefined);

      const response = await controller.logout(req, mockResponse);

      expect(authService.logoutFromRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
      expect(response).toEqual({ ok: true });
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const req = { user: { userId: '1' } } as any;
      const dto: ChangePasswordDto = { currentPassword: 'old-password', newPassword: 'new-password' };
      const result = { ok: true };

      mockAuthService.changePassword.mockResolvedValue(result);

      const response = await controller.changePassword(req, dto);

      expect(authService.changePassword).toHaveBeenCalledWith(req.user.userId, dto);
      expect(response).toEqual(result);
    });
  });
});
