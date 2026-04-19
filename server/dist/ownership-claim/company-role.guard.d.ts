import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
export declare const COMPANY_ROLES_KEY = "companyRoles";
export declare function CompanyRoles(...roles: string[]): (target: any, key?: string, descriptor?: any) => any;
export declare class CompanyRoleGuard implements CanActivate {
    private readonly prisma;
    private readonly reflector;
    constructor(prisma: PrismaService, reflector: Reflector);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
