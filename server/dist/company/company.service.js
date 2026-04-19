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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let CompanyService = class CompanyService {
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async create(ownerId, dto) {
        const ownerRole = await this.prisma.userRole.findUnique({
            where: { userId_role: { userId: ownerId, role: 'company_owner' } },
        });
        if (!ownerRole) {
            throw new common_1.ForbiddenException('You must have the company_owner role to create a company. ' +
                'Set ownsCompany to true via PATCH /users/me/owns-company first.');
        }
        const existing = await this.prisma.company.findUnique({ where: { ownerId } });
        if (existing) {
            throw new common_1.ConflictException('You already own a company');
        }
        return this.prisma.company.create({
            data: {
                name: dto.name,
                ownerId,
                location: dto.location,
                startYear: dto.startYear,
                description: dto.description,
                size: dto.size,
                domain: dto.domain,
            },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
    }
    async findAll() {
        return this.prisma.company.findMany({
            include: { owner: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return company;
    }
    async findByOwner(ownerId) {
        const company = await this.prisma.company.findUnique({
            where: { ownerId },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        if (!company)
            throw new common_1.NotFoundException('You do not own a company yet');
        return company;
    }
    async update(id, requesterId, dto) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== requesterId)
            throw new common_1.ForbiddenException('Not your company');
        return this.prisma.company.update({
            where: { id },
            data: {
                name: dto.name,
                location: dto.location,
                startYear: dto.startYear,
                description: dto.description,
                size: dto.size,
                domain: dto.domain,
            },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
    }
    async setLogo(companyId, userId, logoUrl) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== userId)
            throw new common_1.ForbiddenException('Not authorized');
        return this.prisma.company.update({
            where: { id: companyId },
            data: { logoUrl },
        });
    }
    async remove(id, requesterId) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== requesterId)
            throw new common_1.ForbiddenException('Not your company');
        await this.prisma.company.delete({ where: { id } });
        await this.usersService.setOwnsCompany(requesterId, false);
        return { ok: true };
    }
    async getTrustProfile(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                owner: {
                    select: { verified: true, name: true, email: true },
                },
                fundingRounds: {
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        const isVerified = company.verificationStatus === 'verified' && company.owner?.verified;
        return {
            companyId: company.id,
            name: company.name,
            verifiedBadge: isVerified,
            trustScore: company.trustScore || 0,
            businessProofs: {
                domain: company.websiteDomain,
                startYear: company.startYear,
                gstVerified: !!company.gstin,
                cinVerified: !!company.cinNumber,
            },
            fundingHistory: company.fundingRounds,
        };
    }
    async addFundingRound(companyId, userId, data) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== userId)
            throw new common_1.ForbiddenException('Not authorized');
        return this.prisma.fundingRound.create({
            data: {
                companyId,
                stage: data.stage,
                amount: data.amount,
                date: new Date(data.date),
                investors: data.investors,
            },
        });
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], CompanyService);
//# sourceMappingURL=company.service.js.map