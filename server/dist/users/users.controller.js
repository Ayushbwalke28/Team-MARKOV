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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const users_service_1 = require("./users.service");
const media_service_1 = require("../media/media.service");
const set_owns_company_dto_1 = require("./dto/set-owns-company.dto");
let UsersController = class UsersController {
    constructor(usersService, mediaService) {
        this.usersService = usersService;
        this.mediaService = mediaService;
    }
    async setOwnsCompany(req, body) {
        await this.usersService.setOwnsCompany(req.user.userId, body.ownsCompany);
        const updated = await this.usersService.findByIdWithRoles(req.user.userId);
        return { user: this.usersService.toPublicUser(updated) };
    }
    async uploadAvatar(req, file) {
        const result = await this.mediaService.uploadImage(file);
        await this.usersService.setAvatar(req.user.userId, result.secure_url);
        const updated = await this.usersService.findByIdWithRoles(req.user.userId);
        return { user: this.usersService.toPublicUser(updated), avatarUrl: result.secure_url };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('me/owns-company'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_owns_company_dto_1.SetOwnsCompanyDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setOwnsCompany", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        media_service_1.MediaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map