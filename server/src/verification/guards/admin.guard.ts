import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const adminRole = await this.prisma.userRole.findUnique({
      where: { userId_role: { userId, role: 'admin' } },
    });

    if (!adminRole) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
