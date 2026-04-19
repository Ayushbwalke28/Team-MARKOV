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
exports.AdminReviewController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("./guards/admin.guard");
const admin_review_service_1 = require("./admin-review.service");
const review_decision_dto_1 = require("./dto/review-decision.dto");
let AdminReviewController = class AdminReviewController {
    constructor(adminReviewService) {
        this.adminReviewService = adminReviewService;
    }
    async getQueue(status, page, limit) {
        return this.adminReviewService.getQueue({
            status,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async getReviewDetail(reviewId) {
        return this.adminReviewService.getReviewDetail(reviewId);
    }
    async submitDecision(req, reviewId, body) {
        return this.adminReviewService.submitDecision(reviewId, req.user.userId, body.decision, body.notes);
    }
    async getAuditLog(page, limit) {
        return this.adminReviewService.getAuditLog({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
};
exports.AdminReviewController = AdminReviewController;
__decorate([
    (0, common_1.Get)('queue'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Get)('queue/:reviewId'),
    __param(0, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getReviewDetail", null);
__decorate([
    (0, common_1.Patch)('queue/:reviewId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_decision_dto_1.ReviewDecisionDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "submitDecision", null);
__decorate([
    (0, common_1.Get)('audit-log'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getAuditLog", null);
exports.AdminReviewController = AdminReviewController = __decorate([
    (0, common_1.Controller)('verify/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_review_service_1.AdminReviewService])
], AdminReviewController);
//# sourceMappingURL=admin-review.controller.js.map