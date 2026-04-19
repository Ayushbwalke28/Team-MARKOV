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
var VerificationEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationEventsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let VerificationEventsService = VerificationEventsService_1 = class VerificationEventsService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(VerificationEventsService_1.name);
    }
    emit(eventName, payload) {
        const event = {
            event: eventName,
            ...payload,
            timestamp: new Date().toISOString(),
        };
        this.logger.log(`Emitting ${eventName} for session ${payload.sessionId}`);
        this.eventEmitter.emit(eventName, event);
        this.deliverWebhook(event).catch((err) => this.logger.warn(`Webhook delivery failed for ${eventName}`, err));
    }
    async deliverWebhook(event) {
        const webhookUrl = process.env.VERIFICATION_WEBHOOK_URL;
        if (!webhookUrl)
            return;
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(process.env.VERIFICATION_WEBHOOK_SECRET
                        ? { 'X-Webhook-Secret': process.env.VERIFICATION_WEBHOOK_SECRET }
                        : {}),
                },
                body: JSON.stringify(event),
            });
            if (!response.ok) {
                this.logger.warn(`Webhook returned ${response.status} for ${event.event}`);
            }
        }
        catch (error) {
            this.logger.error(`Webhook delivery error: ${error}`);
        }
    }
};
exports.VerificationEventsService = VerificationEventsService;
exports.VerificationEventsService = VerificationEventsService = VerificationEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], VerificationEventsService);
//# sourceMappingURL=verification-events.service.js.map