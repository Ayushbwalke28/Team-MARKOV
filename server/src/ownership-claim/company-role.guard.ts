import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export const COMPANY_ROLES_KEY = 'companyRoles';

export function CompanyRoles(...roles: string[]) {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(COMPANY_ROLES_KEY, roles, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      COMPANY_ROLES_KEY,
      ctx.getHandler(),
    );

    // If no roles are required at the handler level, allow through
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userId: string = req.user?.userId;
    const companyId: string = req.params?.companyId;

    if (!userId || !companyId) {
      throw new ForbiddenException('Missing user or company context');
    }

    const companyRole = await this.prisma.companyRole.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });

    if (!companyRole || !requiredRoles.includes(companyRole.role)) {
      throw new ForbiddenException(
        `This action requires one of: ${requiredRoles.join(', ')} role`,
      );
    }

    // Attach the resolved role to the request for downstream use
    req.companyRole = companyRole.role;
    return true;
  }
}
