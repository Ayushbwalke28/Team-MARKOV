import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { authConfig, assertAuthSecretsSafeForProd } from './auth.config';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PublicUser } from '../users/users.types';
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
    const user = await this.usersService.findOneByEmailWithRoles(email);
    if (!user || !user.passwordHash) return null;

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

    const fallbackName =
      typeof data.email === 'string' && data.email.includes('@')
        ? data.email.split('@')[0].slice(0, 100)
        : 'New user';

    const created = await this.usersService.create({
      id: randomUUID(),
      email: data.email,
      name: fallbackName.length >= 2 ? fallbackName : 'New user',
      passwordHash: await this.hashPassword(data.password),
    });

    const createdWithRoles = await this.usersService.findByIdWithRoles(created.id);
    const publicUser = this.usersService.toPublicUser(createdWithRoles ?? created);

    // Automatically log in the user after registration
    return this.login(publicUser);
  }

  async validateOAuthUser(profile: any): Promise<PublicUser> {
    // Check if user already exists by googleId
    let user = await this.usersService.findOneByGoogleId(profile.googleId);
    
    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findOneByEmail(profile.email);
      
      if (user) {
        // Link googleId to existing user
        await this.usersService.setGoogleId(user.id, profile.googleId);
      } else {
        // Create new user
        const fallbackName = profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : profile.firstName || profile.email.split('@')[0];
          
        user = await this.usersService.create({
          id: randomUUID(),
          email: profile.email,
          name: fallbackName.slice(0, 100),
          googleId: profile.googleId,
        });
      }
    }
    
    const userWithRoles = await this.usersService.findByIdWithRoles(user.id);
    return this.usersService.toPublicUser(userWithRoles ?? user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findByIdWithRoles(userId);
    if (!user) throw new UnauthorizedException();
    return this.usersService.toPublicUser(user);
  }

  async refreshFromToken(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, { secret: authConfig.jwt.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!decoded || decoded.type !== 'refresh' || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userId = decoded.sub as string;

    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

    if (!this.refreshTokenMatches(refreshToken, user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userWithRoles = await this.usersService.findByIdWithRoles(userId);
    return this.buildAuthResponse(this.usersService.toPublicUser(userWithRoles ?? user));
  }

  async logout(userId: string): Promise<{ ok: true }> {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { ok: true };
  }

  async logoutFromRefreshToken(refreshToken: string | undefined): Promise<{ ok: true }> {
    if (!refreshToken) return { ok: true };
    try {
      const decoded: any = this.jwtService.verify(refreshToken, { secret: authConfig.jwt.refreshSecret });
      if (decoded?.type === 'refresh' && decoded?.sub) {
        await this.usersService.setRefreshTokenHash(decoded.sub as string, null);
      }
    } catch {
      // If it's invalid/expired, we still clear cookies client-side.
    }
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
