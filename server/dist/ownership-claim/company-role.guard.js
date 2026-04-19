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
exports.CompanyRoleGuard = exports.COMPANY_ROLES_KEY = void 0;
exports.CompanyRoles = CompanyRoles;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
exports.COMPANY_ROLES_KEY = 'companyRoles';
function CompanyRoles(...roles) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(exports.COMPANY_ROLES_KEY, roles, descriptor?.value ?? target);
        return descriptor ?? target;
    };
}
let CompanyRoleGuard = class CompanyRoleGuard {
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(ctx) {
        const requiredRoles = this.reflector.get(exports.COMPANY_ROLES_KEY, ctx.getHandler());
        if (!requiredRoles || requiredRoles.length === 0)
            return true;
        const req = ctx.switchToHttp().getRequest();
        const userId = req.user?.userId;
        const companyId = req.params?.companyId;
        if (!userId || !companyId) {
            throw new common_1.ForbiddenException('Missing user or company context');
        }
        const companyRole = await this.prisma.companyRole.findUnique({
            where: { companyId_userId: { companyId, userId } },
        });
        if (!companyRole || !requiredRoles.includes(companyRole.role)) {
            throw new common_1.ForbiddenException(`This action requires one of: ${requiredRoles.join(', ')} role`);
        }
        req.companyRole = companyRole.role;
        return true;
    }
};
exports.CompanyRoleGuard = CompanyRoleGuard;
exports.CompanyRoleGuard = CompanyRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], CompanyRoleGuard);
//# sourceMappingURL=company-role.guard.js.map