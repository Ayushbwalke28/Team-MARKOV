import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { authConfig, assertAuthSecretsSafeForProd } from './auth.config';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PublicUser, User } from '../users/users.types';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    assertAuthSecretsSafeForProd();
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = Number.isFinite(authConfig.bcrypt.rounds) ? authConfig.bcrypt.rounds : 12;
    return bcrypt.hash(password, rounds);
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    // We store only a one-way hash of refresh tokens to reduce blast radius if storage is leaked.
    // Avoid bcrypt here: it truncates inputs (72 bytes), and JWTs are commonly longer.
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private refreshTokenMatches(refreshToken: string, storedHash: string): boolean {
    const candidate = createHash('sha256').update(refreshToken).digest('hex');
    const a = Buffer.from(candidate);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  private async buildAuthResponse(user: PublicUser) {
    const accessPayload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: authConfig.jwt.accessSecret,
      expiresIn: authConfig.jwt.accessTtl,
    });

    // Include a unique token id (jti) so refresh rotation always produces a different token,
    // even when multiple rotations happen within the same second.
    const refreshPayload = { sub: user.id, type: 'refresh', jti: randomUUID() };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: authConfig.jwt.refreshSecret,
      expiresIn: authConfig.jwt.refreshTtl,
    });

    await this.usersService.setRefreshTokenHash(
      user.id,
      await this.hashRefreshToken(refreshToken),
    );

    return { accessToken, refreshToken, user };
  }

  async validateUser(email: string, pass: string): Promise<PublicUser | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;

    return this.usersService.toPublicUser(user);
  }

  async login(user: PublicUser) {
    return this.buildAuthResponse(user);
  }

  async register(data: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const now = new Date();
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email: data.email,
      name: data.name,
      passwordHash: await this.hashPassword(data.password),
      refreshTokenHash: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.usersService.create(newUser);
    
    // Automatically log in the user after registration
    return this.login(this.usersService.toPublicUser(newUser));
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.usersService.toPublicUser(user);
  }

  async refresh(userId: string, dto: RefreshDto) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.refreshToken, { secret: authConfig.jwt.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!decoded || decoded.sub !== userId || decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

    if (!this.refreshTokenMatches(dto.refreshToken, user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(this.usersService.toPublicUser(user));
  }

  async logout(userId: string): Promise<{ ok: true }> {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ ok: true }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid current password');

    await this.usersService.setPasswordHash(userId, await this.hashPassword(dto.newPassword));
    // Invalidate refresh token on password change to force re-auth on other devices.
    await this.usersService.setRefreshTokenHash(userId, null);
    return { ok: true };
  }
}
