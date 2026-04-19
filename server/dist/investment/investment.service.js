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
exports.InvestmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvestmentService = class InvestmentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCompanyInvestmentProfile(companyId, userId, data) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (company.ownerId !== userId)
            throw new common_1.ForbiddenException('Only the founder can create an investment profile');
        if (company.verificationStatus !== 'verified') {
            throw new common_1.ForbiddenException('Your company must be verified to seek investment');
        }
        const existing = await this.prisma.investmentProfile.findUnique({ where: { companyId } });
        if (existing)
            throw new common_1.ConflictException('Investment profile already exists');
        return this.prisma.investmentProfile.create({
            data: {
                companyId,
                fundingStage: data.fundingStage,
                askAmount: data.askAmount,
                pitchDeckUrl: data.pitchDeckUrl,
                financialsUrl: data.financialsUrl,
            },
        });
    }
    async createInvestorProfile(userId, data) {
        const existing = await this.prisma.investorProfile.findUnique({ where: { userId } });
        if (existing)
            throw new common_1.ConflictException('Investor profile already exists');
        return this.prisma.investorProfile.create({
            data: {
                userId,
                investmentThesis: data.investmentThesis,
                accreditationStatus: 'pending',
            },
        });
    }
    async requestDealRoom(companyId, investorId) {
        const investorProfile = await this.prisma.investorProfile.findUnique({ where: { userId: investorId } });
        if (!investorProfile || investorProfile.accreditationStatus !== 'verified') {
            throw new common_1.ForbiddenException('You must be a verified investor to request a deal room');
        }
        const existingRoom = await this.prisma.dealRoom.findUnique({
            where: { companyId_investorId: { companyId, investorId } },
        });
        if (existingRoom) {
            return existingRoom;
        }
        return this.prisma.dealRoom.create({
            data: {
                companyId,
                investorId,
                status: 'requested',
            },
        });
    }
    async signNda(dealRoomId, userId, ndaUrl) {
        const room = await this.prisma.dealRoom.findUnique({
            where: { id: dealRoomId },
            include: { company: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Deal room not found');
        if (room.investorId !== userId && room.company.ownerId !== userId) {
            throw new common_1.ForbiddenException('You are not authorized for this deal room');
        }
        return this.prisma.dealRoom.update({
            where: { id: dealRoomId },
            data: {
                ndaSigned: true,
                ndaUrl,
                status: 'active',
            },
        });
    }
    async getDealRoom(dealRoomId, userId) {
        const room = await this.prisma.dealRoom.findUnique({
            where: { id: dealRoomId },
            include: {
                company: { include: { investmentProfile: true } },
                investor: { include: { investorProfile: true } },
            },
        });
        if (!room)
            throw new common_1.NotFoundException('Deal room not found');
        if (room.investorId !== userId && room.company.ownerId !== userId) {
            throw new common_1.ForbiddenException('Unauthorized access to deal room');
        }
        if (!room.ndaSigned) {
            if (room.company.investmentProfile) {
                room.company.investmentProfile.financialsUrl = null;
            }
        }
        return room;
    }
    async verifyInvestorAccreditation(userId, documentUrl) {
        const profile = await this.prisma.investorProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Investor profile not found');
        return this.prisma.investorProfile.update({
            where: { userId },
            data: {
                accreditationDocumentUrl: documentUrl,
                accreditationStatus: 'pending_review',
                identityVerified: true,
            },
        });
    }
    async reportBroker(dealRoomId, userId, reason) {
        const room = await this.prisma.dealRoom.findUnique({
            where: { id: dealRoomId },
            include: { company: true },
        });
        if (!room)
            throw new common_1.NotFoundException('Deal room not found');
        if (room.investorId !== userId && room.company.ownerId !== userId) {
            throw new common_1.ForbiddenException('You are not authorized for this deal room');
        }
        return this.prisma.dealRoom.update({
            where: { id: dealRoomId },
            data: {
                brokerFlagged: true,
                brokerReportReason: reason,
                status: 'frozen',
            },
        });
    }
};
exports.InvestmentService = InvestmentService;
exports.InvestmentService = InvestmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvestmentService);
//# sourceMappingURL=investment.service.js.map