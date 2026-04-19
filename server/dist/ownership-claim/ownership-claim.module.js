"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipClaimModule = void 0;
const common_1 = require("@nestjs/common");
const ownership_claim_controller_1 = require("./ownership-claim.controller");
const ownership_claim_service_1 = require("./ownership-claim.service");
const domain_email_verification_service_1 = require("./domain-email-verification.service");
const gst_crosscheck_service_1 = require("./gst-crosscheck.service");
const company_role_guard_1 = require("./company-role.guard");
const prisma_module_1 = require("../prisma/prisma.module");
const company_verification_module_1 = require("../company-verification/company-verification.module");
let OwnershipClaimModule = class OwnershipClaimModule {
};
exports.OwnershipClaimModule = OwnershipClaimModule;
exports.OwnershipClaimModule = OwnershipClaimModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, company_verification_module_1.CompanyVerificationModule],
        controllers: [ownership_claim_controller_1.OwnershipClaimController],
        providers: [
            ownership_claim_service_1.OwnershipClaimService,
            domain_email_verification_service_1.DomainEmailVerificationService,
            gst_crosscheck_service_1.GstCrosscheckService,
            company_role_guard_1.CompanyRoleGuard,
        ],
        exports: [ownership_claim_service_1.OwnershipClaimService, company_role_guard_1.CompanyRoleGuard],
    })
], OwnershipClaimModule);
//# sourceMappingURL=ownership-claim.module.js.map