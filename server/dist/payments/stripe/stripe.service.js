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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StripeService = StripeService_1 = class StripeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeService_1.name);
    }
    async holdFundsInEscrow(eventId, userId, amount) {
        this.logger.log(`[Stripe Mock] Holding funds in escrow: $${amount} for Event ${eventId} by User ${userId}`);
        return `pi_mock_${Math.random().toString(36).substring(7)}`;
    }
    async releaseEscrowPayout(eventId, organizerId, amount) {
        this.logger.log(`[Stripe Mock] Releasing $${amount} from escrow to Organizer ${organizerId} for Event ${eventId}`);
        return true;
    }
    async refundBooking(paymentId) {
        this.logger.log(`[Stripe Mock] Processing refund for Payment ID ${paymentId}`);
        return true;
    }
    async processEventPayout(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { bookings: true, fraudReports: true },
        });
        if (!event)
            return;
        const hasUnresolvedFraud = event.fraudReports.some(report => report.status !== 'resolved');
        if (hasUnresolvedFraud) {
            this.logger.warn(`Event ${eventId} has unresolved fraud reports. Payout on hold.`);
            return false;
        }
        const totalCollected = event.bookings.reduce((sum, booking) => sum + event.fees, 0);
        await this.releaseEscrowPayout(eventId, event.organizerUserId || event.organizerCompanyId, totalCollected);
        await this.prisma.event.update({
            where: { id: eventId },
            data: { payoutStatus: 'released' },
        });
        await this.prisma.eventBooking.updateMany({
            where: { eventId },
            data: { escrowStatus: 'released' },
        });
        return true;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map