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
exports.ConnectionController = void 0;
const common_1 = require("@nestjs/common");
const connection_service_1 = require("./connection.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ConnectionController = class ConnectionController {
    constructor(connectionService) {
        this.connectionService = connectionService;
    }
    sendRequest(req, receiverId) {
        return this.connectionService.sendRequest(req.user.userId, receiverId);
    }
    acceptRequest(req, connectionId) {
        return this.connectionService.acceptRequest(req.user.userId, connectionId);
    }
    declineRequest(req, connectionId) {
        return this.connectionService.declineRequest(req.user.userId, connectionId);
    }
    removeConnection(req, connectionId) {
        return this.connectionService.removeConnection(req.user.userId, connectionId);
    }
    getMyConnections(req) {
        return this.connectionService.getMyConnections(req.user.userId);
    }
    getPendingRequests(req) {
        return this.connectionService.getPendingRequests(req.user.userId);
    }
    getSuggestions(req) {
        return this.connectionService.getSuggestions(req.user.userId);
    }
};
exports.ConnectionController = ConnectionController;
__decorate([
    (0, common_1.Post)('request/:receiverId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('receiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "sendRequest", null);
__decorate([
    (0, common_1.Patch)('accept/:connectionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "acceptRequest", null);
__decorate([
    (0, common_1.Patch)('decline/:connectionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "declineRequest", null);
__decorate([
    (0, common_1.Delete)(':connectionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "removeConnection", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "getMyConnections", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConnectionController.prototype, "getSuggestions", null);
exports.ConnectionController = ConnectionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('connections'),
    __metadata("design:paramtypes", [connection_service_1.ConnectionService])
], ConnectionController);
//# sourceMappingURL=connection.controller.js.map