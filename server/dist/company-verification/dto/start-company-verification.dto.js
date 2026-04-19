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
exports.StartCompanyVerificationDto = void 0;
const class_validator_1 = require("class-validator");
class StartCompanyVerificationDto {
}
exports.StartCompanyVerificationDto = StartCompanyVerificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartCompanyVerificationDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'GSTIN is required for company verification' }),
    (0, class_validator_1.Matches)(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i, {
        message: 'GSTIN must be a valid 15-character Indian GST Identification Number (e.g. 22AAAAA0000A1Z5)',
    }),
    __metadata("design:type", String)
], StartCompanyVerificationDto.prototype, "gstin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/i, {
        message: 'CIN must follow the format: U/L + 5 digits + state code + year + company type + 6 digits (e.g. U12345MH2020PTC123456)',
    }),
    __metadata("design:type", String)
], StartCompanyVerificationDto.prototype, "cinNumber", void 0);
//# sourceMappingURL=start-company-verification.dto.js.map