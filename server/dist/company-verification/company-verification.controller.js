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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyVerificationController = void 0;
const common_1 = require("@nestjs/common");
const company_verification_service_1 = require("./company-verification.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const start_company_verification_dto_1 = require("./dto/start-company-verification.dto");
const upload_document_dto_1 = require("./dto/upload-document.dto");
let CompanyVerificationController = class CompanyVerificationController {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    startVerification(req, dto) {
        return this.verificationService.startVerification(dto.companyId, req.user.userId, dto.gstin, dto.cinNumber);
    }
    uploadDocument(req, sessionId, dto) {
        return this.verificationService.submitDocument(sessionId, req.user.userId, dto.documentType, dto.fileUrl, dto.incorporationCertUrl);
    }
    submitForAiVerification(req, sessionId) {
        return this.verificationService.runAiVerification(sessionId, req.user.userId);
    }
    getStatus(req, sessionId) {
        return this.verificationService.getSessionStatus(sessionId, req.user.userId);
    }
};
exports.CompanyVerificationController = CompanyVerificationController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_company_verification_dto_1.StartCompanyVerificationDto]),
    __metadata("design:returntype", void 0)
], CompanyVerificationController.prototype, "startVerification", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':sessionId/upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_document_dto_1.UploadDocumentDto]),
    __metadata("design:returntype", void 0)
], CompanyVerificationController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':sessionId/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CompanyVerificationController.prototype, "submitForAiVerification", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':sessionId/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CompanyVerificationController.prototype, "getStatus", null);
exports.CompanyVerificationController = CompanyVerificationController = __decorate([
    (0, common_1.Controller)('company-verify'),
    __metadata("design:paramtypes", [company_verification_service_1.CompanyVerificationService])
], CompanyVerificationController);
//# sourceMappingURL=company-verification.controller.js.map