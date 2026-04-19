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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles.map((r) => r.role),
                verified: user.verified,
            },
            profile: user.profile,
        };
    }
    async updateMe(userId, dto) {
        await this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, fullName: dto.fullName ?? null },
            update: {},
        });
        const educationWrite = dto.education === undefined
            ? undefined
            : {
                deleteMany: {},
                create: dto.education.map((e) => ({
                    institution: e.institution,
                    degree: e.degree ?? null,
                    fieldOfStudy: e.fieldOfStudy ?? null,
                    startDate: e.startDate ?? null,
                    endDate: e.endDate ?? null,
                    grade: e.grade ?? null,
                    description: e.description ?? null,
                })),
            };
        const experienceWrite = dto.experience === undefined
            ? undefined
            : {
                deleteMany: {},
                create: dto.experience.map((e) => ({
                    title: e.title,
                    company: e.company ?? null,
                    location: e.location ?? null,
                    employmentType: e.employmentType ?? null,
                    startDate: e.startDate ?? null,
                    endDate: e.endDate ?? null,
                    isCurrent: e.isCurrent ?? false,
                    description: e.description ?? null,
                })),
            };
        const certificateWrite = dto.certificates === undefined
            ? undefined
            : {
                deleteMany: {},
                create: dto.certificates.map((c) => ({
                    title: c.title,
                    issuer: c.issuer ?? null,
                    issueDate: c.issueDate ?? null,
                    expirationDate: c.expirationDate ?? null,
                    credentialId: c.credentialId ?? null,
                    credentialUrl: c.credentialUrl ?? null,
                    description: c.description ?? null,
                })),
            };
        const profile = await this.prisma.userProfile.update({
            where: { userId },
            data: {
                fullName: dto.fullName ?? undefined,
                about: dto.about ?? undefined,
                avatarUrl: dto.avatarUrl ?? undefined,
                bannerUrl: dto.bannerUrl ?? undefined,
                dob: dto.dob ?? undefined,
                gender: dto.gender ?? undefined,
                pronouns: dto.pronouns ?? undefined,
                education: educationWrite,
                experience: experienceWrite,
                certificates: certificateWrite,
            },
            include: { education: true, experience: true, certificates: true },
        });
        return profile;
    }
    async updateAvatar(userId, avatarUrl) {
        await this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, avatarUrl },
            update: { avatarUrl },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
        });
        return { avatarUrl };
    }
    async toggleRole(userId, role) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const hasRole = user.roles.some((r) => r.role === role);
        if (role === 'company_owner' && !hasRole) {
            if (!user.verified) {
                throw new common_1.ForbiddenException('Only verified users can become company owners');
            }
        }
        if (hasRole) {
            if (role === 'company_owner') {
                await this.prisma.userRole.deleteMany({
                    where: { userId, role },
                });
            }
        }
        else {
            await this.prisma.userRole.upsert({
                where: { userId_role: { userId, role } },
                update: {},
                create: { userId, role },
            });
        }
        return this.getMe(userId);
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map