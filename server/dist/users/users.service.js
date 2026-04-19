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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOneByEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ?? undefined;
    }
    async findOneByGoogleId(googleId) {
        const user = await this.prisma.user.findUnique({ where: { googleId } });
        return user ?? undefined;
    }
    async findOneByEmailWithRoles(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
        return user ?? undefined;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ?? undefined;
    }
    async findByIdWithRoles(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: true },
        });
        return user ?? undefined;
    }
    async create(input) {
        return this.prisma.user.create({
            data: {
                id: input.id,
                email: input.email,
                name: input.name,
                passwordHash: input.passwordHash ?? null,
                googleId: input.googleId ?? null,
                refreshTokenHash: null,
                profile: {
                    create: {
                        fullName: input.name,
                    },
                },
                roles: {
                    create: [{ role: 'candidate' }],
                },
            },
        });
    }
    async setRefreshTokenHash(userId, refreshTokenHash) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash },
        });
    }
    async setGoogleId(userId, googleId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { googleId },
        });
    }
    async setPasswordHash(userId, passwordHash) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }
    async setVerified(userId, verified) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { verified },
        });
    }
    async setAvatar(userId, avatarUrl) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
        });
    }
    async setOwnsCompany(userId, ownsCompany) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.ForbiddenException('User not found');
        if (!user.verified)
            throw new common_1.ForbiddenException('Only verified users can own a company');
        if (ownsCompany) {
            await this.prisma.userRole.upsert({
                where: { userId_role: { userId, role: 'company_owner' } },
                update: {},
                create: { userId, role: 'company_owner' },
            });
        }
        else {
            await this.prisma.userRole.deleteMany({
                where: { userId, role: 'company_owner' },
            });
        }
    }
    toPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: (user.roles ?? []).map((r) => r.role),
            verified: user.verified,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map