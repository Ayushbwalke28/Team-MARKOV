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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDecideClaimDto = exports.AdminGrantRole = exports.AdminDecision = void 0;
const class_validator_1 = require("class-validator");
var AdminDecision;
(function (AdminDecision) {
    AdminDecision["approved"] = "approved";
    AdminDecision["rejected"] = "rejected";
})(AdminDecision || (exports.AdminDecision = AdminDecision = {}));
var AdminGrantRole;
(function (AdminGrantRole) {
    AdminGrantRole["owner"] = "owner";
    AdminGrantRole["founder"] = "founder";
    AdminGrantRole["authorized"] = "authorized";
})(AdminGrantRole || (exports.AdminGrantRole = AdminGrantRole = {}));
class AdminDecideClaimDto {
}
exports.AdminDecideClaimDto = AdminDecideClaimDto;
__decorate([
    (0, class_validator_1.IsEnum)(AdminDecision),
    __metadata("design:type", String)
], AdminDecideClaimDto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AdminGrantRole),
    __metadata("design:type", String)
], AdminDecideClaimDto.prototype, "grantRole", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminDecideClaimDto.prototype, "notes", void 0);
//# sourceMappingURL=admin-decide-claim.dto.js.map