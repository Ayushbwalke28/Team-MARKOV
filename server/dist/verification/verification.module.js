"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const verification_controller_1 = require("./verification.controller");
const admin_review_controller_1 = require("./admin-review.controller");
const verification_service_1 = require("./verification.service");
const admin_review_service_1 = require("./admin-review.service");
const ocr_service_1 = require("./ocr.service");
const document_validator_service_1 = require("./document-validator.service");
const face_service_1 = require("./face.service");
const verification_events_service_1 = require("./verification-events.service");
let VerificationModule = class VerificationModule {
};
exports.VerificationModule = VerificationModule;
exports.VerificationModule = VerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot()],
        controllers: [verification_controller_1.VerificationController, admin_review_controller_1.AdminReviewController],
        providers: [
            verification_service_1.VerificationService,
            admin_review_service_1.AdminReviewService,
            ocr_service_1.OcrService,
            document_validator_service_1.DocumentValidatorService,
            face_service_1.FaceService,
            verification_events_service_1.VerificationEventsService,
        ],
        exports: [verification_service_1.VerificationService],
    })
], VerificationModule);
//# sourceMappingURL=verification.module.js.map