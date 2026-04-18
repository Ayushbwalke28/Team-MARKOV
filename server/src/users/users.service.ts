import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserInput, PublicUser, User, UserId, UserRoleType } from './users.types';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ?? undefined;
  }

  async findOneByEmailWithRoles(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
    return user ?? undefined;
  }

  async findById(id: UserId): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ?? undefined;
  }

  async findByIdWithRoles(id: UserId) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    return user ?? undefined;
  }

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        refreshTokenHash: null,
        profile: {
          create: {
            fullName: input.name,
          },
        },
        roles: {
          create: [{ role: 'candidate' }],
        },
      } satisfies Prisma.UserCreateInput,
    });
  }

  async setRefreshTokenHash(userId: UserId, refreshTokenHash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async setPasswordHash(userId: UserId, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async setVerified(userId: UserId, verified: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { verified },
    });
  }

  async setAvatar(userId: UserId, avatarUrl: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async setOwnsCompany(userId: UserId, ownsCompany: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    if (!user.verified) throw new ForbiddenException('Only verified users can own a company');

    if (ownsCompany) {
      await this.prisma.userRole.upsert({
        where: { userId_role: { userId, role: 'company_owner' } },
        update: {},
        create: { userId, role: 'company_owner' },
      });
    } else {
      await this.prisma.userRole.deleteMany({
        where: { userId, role: 'company_owner' },
      });
    }
  }

  toPublicUser(
    user: Pick<User, 'id' | 'email' | 'name' | 'verified'> & { roles?: Array<{ role: UserRoleType }> },
  ): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: (user.roles ?? []).map((r) => r.role),
      verified: user.verified,
    };
  }
}
