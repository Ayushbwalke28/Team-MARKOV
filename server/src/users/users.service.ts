import { Injectable } from '@nestjs/common';
import { PublicUser, User, UserId } from './users.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ?? undefined;
  }

  async findById(id: UserId): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ?? undefined;
  }

  async create(user: User): Promise<User> {
    // `user` is already in our domain shape; Prisma returns same field names.
    return this.prisma.user.create({ data: user });
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

  toPublicUser(user: User): PublicUser {
    return { id: user.id, email: user.email, name: user.name };
  }
}
