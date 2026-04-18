import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  async setVerified(userId: string, verified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { verified },
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
        roles: { select: { role: true } },
      },
    });
  }
}

