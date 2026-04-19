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
exports.AdminClaimsController = void 0;
const common_1 = require("@nestjs/common");
const ownership_claim_service_1 = require("../ownership-claim/ownership-claim.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const admin_decide_claim_dto_1 = require("../ownership-claim/dto/admin-decide-claim.dto");
let AdminClaimsController = class AdminClaimsController {
    constructor(claimService) {
        this.claimService = claimService;
    }
    getStats() {
        return this.claimService.adminGetStats();
    }
    listClaims(status, page = '1', limit = '20') {
        return this.claimService.adminListClaims(status, Number(page), Number(limit));
    }
    getClaimDetail(claimId) {
        return this.claimService.adminGetClaimDetail(claimId);
    }
    decide(req, claimId, dto) {
        return this.claimService.adminDecide(claimId, req.user.userId, dto);
    }
};
exports.AdminClaimsController = AdminClaimsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminClaimsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminClaimsController.prototype, "listClaims", null);
__decorate([
    (0, common_1.Get)(':claimId'),
    __param(0, (0, common_1.Param)('claimId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminClaimsController.prototype, "getClaimDetail", null);
__decorate([
    (0, common_1.Patch)(':claimId/decide'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('claimId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_decide_claim_dto_1.AdminDecideClaimDto]),
    __metadata("design:returntype", void 0)
], AdminClaimsController.prototype, "decide", null);
exports.AdminClaimsController = AdminClaimsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('admin/ownership-claims'),
    __metadata("design:paramtypes", [ownership_claim_service_1.OwnershipClaimService])
], AdminClaimsController);
//# sourceMappingURL=admin-claims.controller.js.map