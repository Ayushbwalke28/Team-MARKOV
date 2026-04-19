"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const auth_config_1 = require("./auth.config");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        (0, auth_config_1.assertAuthSecretsSafeForProd)();
    }
    async hashPassword(password) {
        const rounds = Number.isFinite(auth_config_1.authConfig.bcrypt.rounds) ? auth_config_1.authConfig.bcrypt.rounds : 12;
        return bcrypt.hash(password, rounds);
    }
    async hashRefreshToken(refreshToken) {
        return (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
    }
    refreshTokenMatches(refreshToken, storedHash) {
        const candidate = (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
        const a = Buffer.from(candidate);
        const b = Buffer.from(storedHash);
        if (a.length !== b.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(a, b);
    }
    async buildAuthResponse(user) {
        const accessPayload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(accessPayload, {
            secret: auth_config_1.authConfig.jwt.accessSecret,
            expiresIn: auth_config_1.authConfig.jwt.accessTtl,
        });
        const refreshPayload = { sub: user.id, type: 'refresh', jti: (0, crypto_1.randomUUID)() };
        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: auth_config_1.authConfig.jwt.refreshSecret,
            expiresIn: auth_config_1.authConfig.jwt.refreshTtl,
        });
        await this.usersService.setRefreshTokenHash(user.id, await this.hashRefreshToken(refreshToken));
        return { accessToken, refreshToken, user };
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOneByEmailWithRoles(email);
        if (!user || !user.passwordHash)
            return null;
        const ok = await bcrypt.compare(pass, user.passwordHash);
        if (!ok)
            return null;
        return this.usersService.toPublicUser(user);
    }
    async login(user) {
        return this.buildAuthResponse(user);
    }
    async register(data) {
        const existingUser = await this.usersService.findOneByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const fallbackName = typeof data.email === 'string' && data.email.includes('@')
            ? data.email.split('@')[0].slice(0, 100)
            : 'New user';
        const created = await this.usersService.create({
            id: (0, crypto_1.randomUUID)(),
            email: data.email,
            name: fallbackName.length >= 2 ? fallbackName : 'New user',
            passwordHash: await this.hashPassword(data.password),
        });
        const createdWithRoles = await this.usersService.findByIdWithRoles(created.id);
        const publicUser = this.usersService.toPublicUser(createdWithRoles ?? created);
        return this.login(publicUser);
    }
    async validateOAuthUser(profile) {
        let user = await this.usersService.findOneByGoogleId(profile.googleId);
        if (!user) {
            user = await this.usersService.findOneByEmail(profile.email);
            if (user) {
                await this.usersService.setGoogleId(user.id, profile.googleId);
            }
            else {
                const fallbackName = profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.firstName || profile.email.split('@')[0];
                user = await this.usersService.create({
                    id: (0, crypto_1.randomUUID)(),
                    email: profile.email,
                    name: fallbackName.slice(0, 100),
                    googleId: profile.googleId,
                });
            }
        }
        const userWithRoles = await this.usersService.findByIdWithRoles(user.id);
        return this.usersService.toPublicUser(userWithRoles ?? user);
    }
    async me(userId) {
        const user = await this.usersService.findByIdWithRoles(userId);
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.usersService.toPublicUser(user);
    }
    async refreshFromToken(refreshToken) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('Missing refresh token');
        let decoded;
        try {
            decoded = this.jwtService.verify(refreshToken, { secret: auth_config_1.authConfig.jwt.refreshSecret });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (!decoded || decoded.type !== 'refresh' || !decoded.sub) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const userId = decoded.sub;
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshTokenHash)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        if (!this.refreshTokenMatches(refreshToken, user.refreshTokenHash)) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const userWithRoles = await this.usersService.findByIdWithRoles(userId);
        return this.buildAuthResponse(this.usersService.toPublicUser(userWithRoles ?? user));
    }
    async logout(userId) {
        await this.usersService.setRefreshTokenHash(userId, null);
        return { ok: true };
    }
    async logoutFromRefreshToken(refreshToken) {
        if (!refreshToken)
            return { ok: true };
        try {
            const decoded = this.jwtService.verify(refreshToken, { secret: auth_config_1.authConfig.jwt.refreshSecret });
            if (decoded?.type === 'refresh' && decoded?.sub) {
                await this.usersService.setRefreshTokenHash(decoded.sub, null);
            }
        }
        catch {
        }
        return { ok: true };
    }
    async changePassword(userId, dto) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.UnauthorizedException();
        const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid current password');
        await this.usersService.setPasswordHash(userId, await this.hashPassword(dto.newPassword));
        await this.usersService.setRefreshTokenHash(userId, null);
        return { ok: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map