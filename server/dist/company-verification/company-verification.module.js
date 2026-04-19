"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyVerificationModule = void 0;
const common_1 = require("@nestjs/common");
const company_verification_controller_1 = require("./company-verification.controller");
const company_verification_service_1 = require("./company-verification.service");
const ai_verification_service_1 = require("./ai-verification.service");
const prisma_module_1 = require("../prisma/prisma.module");
let CompanyVerificationModule = class CompanyVerificationModule {
};
exports.CompanyVerificationModule = CompanyVerificationModule;
exports.CompanyVerificationModule = CompanyVerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [company_verification_controller_1.CompanyVerificationController],
        providers: [company_verification_service_1.CompanyVerificationService, ai_verification_service_1.AiVerificationService],
        exports: [ai_verification_service_1.AiVerificationService],
    })
], CompanyVerificationModule);
//# sourceMappingURL=company-verification.module.js.map