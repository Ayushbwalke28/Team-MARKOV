import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompanyInvestmentProfile(companyId: string, userId: string, data: any) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException('Only the founder can create an investment profile');
    
    if (company.verificationStatus !== 'verified') {
      throw new ForbiddenException('Your company must be verified to seek investment');
    }

    const existing = await this.prisma.investmentProfile.findUnique({ where: { companyId } });
    if (existing) throw new ConflictException('Investment profile already exists');

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

  async createInvestorProfile(userId: string, data: any) {
    const existing = await this.prisma.investorProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Investor profile already exists');

    return this.prisma.investorProfile.create({
      data: {
        userId,
        investmentThesis: data.investmentThesis,
        accreditationStatus: 'pending', // Requires admin approval in reality
      },
    });
  }

  async requestDealRoom(companyId: string, investorId: string) {
    const investorProfile = await this.prisma.investorProfile.findUnique({ where: { userId: investorId } });
    if (!investorProfile || investorProfile.accreditationStatus !== 'verified') {
      throw new ForbiddenException('You must be a verified investor to request a deal room');
    }

    const existingRoom = await this.prisma.dealRoom.findUnique({
      where: { companyId_investorId: { companyId, investorId } },
    });

    if (existingRoom) {
      return existingRoom; // Return existing if already requested
    }

    return this.prisma.dealRoom.create({
      data: {
        companyId,
        investorId,
        status: 'requested',
      },
    });
  }

  async signNda(dealRoomId: string, userId: string, ndaUrl: string) {
    const room = await this.prisma.dealRoom.findUnique({
      where: { id: dealRoomId },
      include: { company: true },
    });

    if (!room) throw new NotFoundException('Deal room not found');
    if (room.investorId !== userId && room.company.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized for this deal room');
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

  async getDealRoom(dealRoomId: string, userId: string) {
    const room = await this.prisma.dealRoom.findUnique({
      where: { id: dealRoomId },
      include: {
        company: { include: { investmentProfile: true } },
        investor: { include: { investorProfile: true } },
      },
    });

    if (!room) throw new NotFoundException('Deal room not found');
    
    // Strict access control: Only verified founder and verified investor
    if (room.investorId !== userId && room.company.ownerId !== userId) {
      throw new ForbiddenException('Unauthorized access to deal room');
    }

    // Hide sensitive data if NDA is not signed
    if (!room.ndaSigned) {
      if (room.company.investmentProfile) {
        room.company.investmentProfile.financialsUrl = null; // Mask financials
      }
    }

    return room;
  }

  async verifyInvestorAccreditation(userId: string, documentUrl: string) {
    const profile = await this.prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Investor profile not found');

    return this.prisma.investorProfile.update({
      where: { userId },
      data: {
        accreditationDocumentUrl: documentUrl,
        accreditationStatus: 'pending_review',
        identityVerified: true, // Assuming KYC happened prior
      },
    });
  }

  async reportBroker(dealRoomId: string, userId: string, reason: string) {
    const room = await this.prisma.dealRoom.findUnique({
      where: { id: dealRoomId },
      include: { company: true },
    });

    if (!room) throw new NotFoundException('Deal room not found');
    if (room.investorId !== userId && room.company.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized for this deal room');
    }

    return this.prisma.dealRoom.update({
      where: { id: dealRoomId },
      data: {
        brokerFlagged: true,
        brokerReportReason: reason,
        status: 'frozen', // Optional: freeze the room upon report
      },
    });
  }
}
