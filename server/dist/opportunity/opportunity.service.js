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
exports.OpportunityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OpportunityService = class OpportunityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerId, dto) {
        const company = await this.prisma.company.findUnique({
            where: { ownerId },
        });
        if (!company) {
            throw new common_1.ForbiddenException('You must own a company to create an opportunity.');
        }
        return this.prisma.opportunity.create({
            data: {
                companyId: company.id,
                type: dto.type,
                mode: dto.mode,
                status: dto.status,
                payment: dto.payment,
                postName: dto.postName,
                description: dto.description,
                registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
            },
            include: {
                company: {
                    select: { id: true, name: true }
                }
            }
        });
    }
    async findAll() {
        return this.prisma.opportunity.findMany({
            include: {
                company: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllByCompany(companyId) {
        return this.prisma.opportunity.findMany({
            where: { companyId },
            include: {
                company: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: { id },
            include: {
                company: {
                    select: { id: true, name: true }
                }
            },
        });
        if (!opportunity)
            throw new common_1.NotFoundException('Opportunity not found');
        return opportunity;
    }
    async update(id, ownerId, dto) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: { id },
            include: { company: true },
        });
        if (!opportunity)
            throw new common_1.NotFoundException('Opportunity not found');
        if (opportunity.company.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Not your opportunity');
        }
        return this.prisma.opportunity.update({
            where: { id },
            data: {
                type: dto.type,
                mode: dto.mode,
                status: dto.status,
                payment: dto.payment,
                postName: dto.postName,
                description: dto.description,
                registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
            },
            include: {
                company: {
                    select: { id: true, name: true }
                }
            },
        });
    }
    async remove(id, ownerId) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: { id },
            include: { company: true },
        });
        if (!opportunity)
            throw new common_1.NotFoundException('Opportunity not found');
        if (opportunity.company.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Not your opportunity');
        }
        await this.prisma.opportunity.delete({ where: { id } });
        return { ok: true };
    }
};
exports.OpportunityService = OpportunityService;
exports.OpportunityService = OpportunityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpportunityService);
//# sourceMappingURL=opportunity.service.js.map