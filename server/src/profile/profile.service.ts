import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
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

    if (!user) throw new NotFoundException('User not found');

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

  async updateMe(userId: string, dto: UpdateProfileDto) {
    // Ensure profile exists (it should be created on register, but keep this safe).
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, fullName: dto.fullName ?? null },
      update: {},
    });

    const educationWrite =
      dto.education === undefined
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

    const experienceWrite =
      dto.experience === undefined
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

    const certificateWrite =
      dto.certificates === undefined
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
        gender: (dto.gender as any) ?? undefined,
        pronouns: dto.pronouns ?? undefined,
        education: educationWrite,
        experience: experienceWrite,
        certificates: certificateWrite,
      },
      include: { education: true, experience: true, certificates: true },
    });

    return profile;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
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

  async toggleRole(userId: string, role: 'candidate' | 'company_owner') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const hasRole = user.roles.some((r) => r.role === role);

    if (role === 'company_owner' && !hasRole) {
      if (!user.verified) {
        throw new ForbiddenException('Only verified users can become company owners');
      }
    }

    if (hasRole) {
      // Remove role (unless it's candidate and they have no other roles?)
      // For now, just allow removing company_owner
      if (role === 'company_owner') {
        await this.prisma.userRole.deleteMany({
          where: { userId, role },
        });
      }
    } else {
      // Add role
      await this.prisma.userRole.upsert({
        where: { userId_role: { userId, role } },
        update: {},
        create: { userId, role },
      });
    }

    return this.getMe(userId);
  }
}

