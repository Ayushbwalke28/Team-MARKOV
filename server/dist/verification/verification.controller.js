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
exports.VerificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const verification_service_1 = require("./verification.service");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const consent_dto_1 = require("./dto/consent.dto");
let VerificationController = class VerificationController {
    constructor(verificationService) {
        this.verificationService = verificationService;
    }
    async startSession(req) {
        return this.verificationService.startSession(req.user.userId);
    }
    async recordConsent(req, sessionId, body) {
        if (!body.consent) {
            throw new common_1.BadRequestException('Consent must be given to proceed');
        }
        return this.verificationService.recordConsent(sessionId, req.user.userId);
    }
    async uploadDocument(req, sessionId, body, files) {
        if (!files?.front?.[0]) {
            throw new common_1.BadRequestException('Front image of the document is required');
        }
        const frontFile = files.front[0];
        const backFile = files.back?.[0];
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimes.includes(frontFile.mimetype)) {
            throw new common_1.BadRequestException('Unsupported file format. Use JPEG, PNG, or PDF.');
        }
        if (backFile && !allowedMimes.includes(backFile.mimetype)) {
            throw new common_1.BadRequestException('Unsupported back image format. Use JPEG, PNG, or PDF.');
        }
        return this.verificationService.uploadDocument(sessionId, req.user.userId, body.documentType, frontFile.buffer, backFile?.buffer);
    }
    async captureFace(req, sessionId, file) {
        if (!file) {
            throw new common_1.BadRequestException('Selfie image is required');
        }
        const allowedMimes = ['image/jpeg', 'image/png'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Selfie must be JPEG or PNG');
        }
        return this.verificationService.captureFace(sessionId, req.user.userId, file.buffer);
    }
    async getSessionStatus(req, sessionId) {
        return this.verificationService.getSessionStatus(sessionId, req.user.userId);
    }
    async getMyVerification(req) {
        return this.verificationService.getUserVerificationStatus(req.user.userId);
    }
    async retryVerification(req) {
        return this.verificationService.startSession(req.user.userId);
    }
    async deleteVerificationData(req) {
        return this.verificationService.deleteUserData(req.user.userId);
    }
    getConsentInfo() {
        return {
            required: true,
            disclosure: [
                'We will capture your government-issued ID and a live selfie to verify your identity.',
                'Your biometric data (facial image) will be processed server-side and not stored permanently.',
                'Only verification status, confidence score, and timestamp are retained.',
                'Raw images are automatically deleted after processing (within 24 hours maximum).',
                'You may request deletion of all verification data at any time.',
                'By consenting, you agree to the processing of your biometric and identity data for verification purposes only.',
            ],
            dataProcessed: [
                'Government ID image (front and back)',
                'Live selfie/photo',
                'Extracted text data (name, DOB, ID number)',
            ],
            retentionPolicy: 'Raw images deleted within 24 hours. Metadata retained until account deletion.',
            rightsInfo: 'You have the right to request deletion of your verification data via DELETE /api/verify/data.',
        };
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('consent/:sessionId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, consent_dto_1.ConsentDto]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Post)(':sessionId/document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_document_dto_1.UploadDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)(':sessionId/face'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('selfie')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "captureFace", null);
__decorate([
    (0, common_1.Get)('status/:sessionId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getSessionStatus", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getMyVerification", null);
__decorate([
    (0, common_1.Post)('retry'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "retryVerification", null);
__decorate([
    (0, common_1.Delete)('data'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "deleteVerificationData", null);
__decorate([
    (0, common_1.Get)('consent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VerificationController.prototype, "getConsentInfo", null);
exports.VerificationController = VerificationController = __decorate([
    (0, common_1.Controller)('verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [verification_service_1.VerificationService])
], VerificationController);
//# sourceMappingURL=verification.controller.js.map