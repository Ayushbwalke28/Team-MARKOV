import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async startVerification(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException('Only the owner can start verification');

    if (company.verificationStatus === 'verified') {
      throw new BadRequestException('Company is already verified');
    }

    // Create a new session
    return this.prisma.companyVerificationSession.create({
      data: {
        companyId,
        userId,
        status: 'pending',
      },
    });
  }

  async submitDocument(sessionId: string, userId: string, documentType: string, fileUrl: string) {
    const session = await this.prisma.companyVerificationSession.findUnique({
      where: { id: sessionId },
      include: { company: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Not your session');

    // Update company with document URL
    await this.prisma.company.update({
      where: { id: session.companyId },
      data: { registrationDocumentUrl: fileUrl },
    });

    // Update session
    return this.prisma.companyVerificationSession.update({
      where: { id: sessionId },
      data: {
        documentType,
        status: 'document_uploaded',
      },
    });
  }

  async runMockApiValidation(sessionId: string, userId: string) {
    const session = await this.prisma.companyVerificationSession.findUnique({
      where: { id: sessionId },
      include: { company: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Not your session');
    if (session.status !== 'document_uploaded') throw new BadRequestException('Upload document first');

    // Simulate API call to mock KYC provider
    const isSuccess = Math.random() > 0.1; // 90% success rate for mock

    if (isSuccess) {
      await this.prisma.company.update({
        where: { id: session.companyId },
        data: {
          verificationStatus: 'verified',
          verifiedAt: new Date(),
        },
      });

      return this.prisma.companyVerificationSession.update({
        where: { id: sessionId },
        data: {
          apiValidationSuccessful: true,
          documentValid: true,
          status: 'passed',
        },
      });
    } else {
      await this.prisma.company.update({
        where: { id: session.companyId },
        data: { verificationStatus: 'rejected' },
      });

      return this.prisma.companyVerificationSession.update({
        where: { id: sessionId },
        data: {
          apiValidationSuccessful: false,
          failureReason: 'Business Registration ID not found in official registry',
          status: 'failed',
        },
      });
    }
  }

  async getSessionStatus(sessionId: string, userId: string) {
    const session = await this.prisma.companyVerificationSession.findUnique({
      where: { id: sessionId },
      include: { company: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Not your session');

    return session;
  }
}
