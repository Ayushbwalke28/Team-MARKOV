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
exports.OwnershipClaimController = void 0;
const common_1 = require("@nestjs/common");
const ownership_claim_service_1 = require("./ownership-claim.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_claim_dto_1 = require("./dto/create-claim.dto");
const send_domain_otp_dto_1 = require("./dto/send-domain-otp.dto");
const verify_domain_otp_dto_1 = require("./dto/verify-domain-otp.dto");
const upload_claim_document_dto_1 = require("./dto/upload-claim-document.dto");
const gst_validate_dto_1 = require("./dto/gst-validate.dto");
let OwnershipClaimController = class OwnershipClaimController {
    constructor(claimService) {
        this.claimService = claimService;
    }
    create(req, dto) {
        return this.claimService.createClaim(req.user.userId, dto);
    }
    getMyClaims(req) {
        return this.claimService.getMyClaims(req.user.userId);
    }
    getDetail(req, claimId) {
        return this.claimService.getClaimDetail(claimId, req.user.userId);
    }
    withdraw(req, claimId) {
        return this.claimService.withdrawClaim(claimId, req.user.userId);
    }
    sendDomainOtp(req, claimId, dto) {
        return this.claimService.sendDomainOtp(claimId, req.user.userId, dto.email);
    }
    verifyDomainOtp(req, claimId, dto) {
        return this.claimService.verifyDomainOtp(claimId, req.user.userId, dto.otp);
    }
    uploadDocuments(req, claimId, dto) {
        return this.claimService.uploadDocuments(claimId, req.user.userId, dto.authorizationLetterUrl, dto.governmentIdUrl);
    }
    validateGstin(req, claimId, dto) {
        return this.claimService.validateGstin(claimId, req.user.userId, dto.gstin, dto.cinNumber);
    }
    requestAdminReview(req, claimId) {
        return this.claimService.requestAdminReview(claimId, req.user.userId);
    }
};
exports.OwnershipClaimController = OwnershipClaimController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_claim_dto_1.CreateClaimDto]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "getMyClaims", null);
__decorate([
    (0, common_1.Get)(':claimId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Delete)(':claimId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':claimId/domain-email/send-otp'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_domain_otp_dto_1.SendDomainOtpDto]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "sendDomainOtp", null);
__decorate([
    (0, common_1.Post)(':claimId/domain-email/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, verify_domain_otp_dto_1.VerifyDomainOtpDto]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "verifyDomainOtp", null);
__decorate([
    (0, common_1.Post)(':claimId/documents'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_claim_document_dto_1.UploadClaimDocumentDto]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Post)(':claimId/gst-validate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, gst_validate_dto_1.GstValidateDto]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "validateGstin", null);
__decorate([
    (0, common_1.Post)(':claimId/request-admin-review'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnershipClaimController.prototype, "requestAdminReview", null);
exports.OwnershipClaimController = OwnershipClaimController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ownership-claims'),
    __metadata("design:paramtypes", [ownership_claim_service_1.OwnershipClaimService])
], OwnershipClaimController);
//# sourceMappingURL=ownership-claim.controller.js.map