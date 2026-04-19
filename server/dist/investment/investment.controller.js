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
exports.InvestmentController = void 0;
const common_1 = require("@nestjs/common");
const investment_service_1 = require("./investment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InvestmentController = class InvestmentController {
    constructor(investmentService) {
        this.investmentService = investmentService;
    }
    createCompanyProfile(req, companyId, body) {
        return this.investmentService.createCompanyInvestmentProfile(companyId, req.user.userId, body);
    }
    createInvestorProfile(req, body) {
        return this.investmentService.createInvestorProfile(req.user.userId, body);
    }
    requestDealRoom(req, companyId) {
        return this.investmentService.requestDealRoom(companyId, req.user.userId);
    }
    signNda(req, dealRoomId, ndaUrl) {
        return this.investmentService.signNda(dealRoomId, req.user.userId, ndaUrl);
    }
    getDealRoom(req, dealRoomId) {
        return this.investmentService.getDealRoom(dealRoomId, req.user.userId);
    }
    verifyAccreditation(req, documentUrl) {
        return this.investmentService.verifyInvestorAccreditation(req.user.userId, documentUrl);
    }
    reportBroker(req, dealRoomId, reason) {
        return this.investmentService.reportBroker(dealRoomId, req.user.userId, reason);
    }
};
exports.InvestmentController = InvestmentController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('company/:companyId/profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('companyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "createCompanyProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('investor/profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "createInvestorProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('deal-room/:companyId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "requestDealRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('deal-room/:id/nda'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('ndaUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "signNda", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('deal-room/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "getDealRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('investor/verify-accreditation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('documentUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "verifyAccreditation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('deal-room/:id/report-broker'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "reportBroker", null);
exports.InvestmentController = InvestmentController = __decorate([
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investment_service_1.InvestmentService])
], InvestmentController);
//# sourceMappingURL=investment.controller.js.map