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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const stripe_service_1 = require("../payments/stripe/stripe.service");
const razorpay_service_1 = require("../payments/razorpay/razorpay.service");
const EVENT_INCLUDE = {
    organizerUser: { select: { id: true, name: true } },
    organizerCompany: { select: { id: true, name: true } },
    _count: {
        select: { bookings: true },
    },
};
let EventService = class EventService {
    constructor(prisma, stripeService, razorpayService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.razorpayService = razorpayService;
    }
    async create(userId, dto) {
        let organizerCompanyId = undefined;
        let organizerUserId = undefined;
        if (dto.organizerType === client_1.OrganizerType.company) {
            const company = await this.prisma.company.findUnique({
                where: { ownerId: userId },
            });
            if (!company) {
                throw new common_1.ForbiddenException('You must own a company to create a company event.');
            }
            organizerCompanyId = company.id;
        }
        else {
            organizerUserId = userId;
        }
        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                organizerType: dto.organizerType,
                schedule: new Date(dto.schedule),
                fees: dto.fees || 0,
                mode: dto.mode,
                venue: dto.venue,
                onlinePlatform: dto.onlinePlatform,
                organizerUserId,
                organizerCompanyId,
            },
            include: EVENT_INCLUDE,
        });
    }
    async findAll() {
        return this.prisma.event.findMany({
            include: EVENT_INCLUDE,
            orderBy: { schedule: 'asc' },
        });
    }
    async findById(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: EVENT_INCLUDE,
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async verifyOwnership(id, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { organizerCompany: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.organizerType === client_1.OrganizerType.individual) {
            if (event.organizerUserId !== userId) {
                throw new common_1.ForbiddenException('Not your event');
            }
        }
        else if (event.organizerType === client_1.OrganizerType.company) {
            if (event.organizerCompany?.ownerId !== userId) {
                throw new common_1.ForbiddenException('Not your event');
            }
        }
        return event;
    }
    async update(id, userId, dto) {
        await this.verifyOwnership(id, userId);
        return this.prisma.event.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                schedule: dto.schedule ? new Date(dto.schedule) : undefined,
                fees: dto.fees,
                mode: dto.mode,
                venue: dto.venue,
                onlinePlatform: dto.onlinePlatform,
            },
            include: EVENT_INCLUDE,
        });
    }
    async setBanner(eventId, userId, bannerUrl) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.organizerType === 'individual') {
            if (event.organizerUserId !== userId) {
                throw new common_1.ForbiddenException('Not authorized');
            }
        }
        else {
            const company = await this.prisma.company.findUnique({
                where: { id: event.organizerCompanyId },
            });
            if (company?.ownerId !== userId) {
                throw new common_1.ForbiddenException('Not authorized');
            }
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: { bannerUrl },
        });
    }
    async remove(id, userId) {
        await this.verifyOwnership(id, userId);
        await this.prisma.event.delete({ where: { id } });
        return { ok: true };
    }
    async bookEvent(id, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const existingBooking = await this.prisma.eventBooking.findUnique({
            where: {
                eventId_userId: {
                    eventId: id,
                    userId,
                },
            },
        });
        if (existingBooking) {
            throw new common_1.ConflictException('You have already booked this event');
        }
        let paymentId = undefined;
        let escrowStatus = 'pending';
        if (event.fees > 0) {
            paymentId = await this.stripeService.holdFundsInEscrow(event.id, userId, event.fees);
            escrowStatus = 'held';
        }
        return this.prisma.eventBooking.create({
            data: {
                eventId: id,
                userId,
                paymentId,
                escrowStatus,
            },
            include: {
                event: {
                    select: { id: true, title: true, schedule: true, mode: true, fees: true },
                },
            },
        });
    }
    async cancelBooking(id, userId) {
        const booking = await this.prisma.eventBooking.findUnique({
            where: {
                eventId_userId: {
                    eventId: id,
                    userId,
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('You have not booked this event');
        }
        await this.prisma.eventBooking.delete({
            where: {
                eventId_userId: {
                    eventId: id,
                    userId,
                },
            },
        });
        return { ok: true };
    }
    async getBookings(id, userId) {
        await this.verifyOwnership(id, userId);
        return this.prisma.eventBooking.findMany({
            where: { eventId: id },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMyBookings(userId) {
        return this.prisma.eventBooking.findMany({
            where: { userId },
            include: {
                event: {
                    include: EVENT_INCLUDE,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMyEvents(userId) {
        const company = await this.prisma.company.findUnique({
            where: { ownerId: userId },
        });
        return this.prisma.event.findMany({
            where: {
                OR: [
                    { organizerUserId: userId },
                    ...(company ? [{ organizerCompanyId: company.id }] : []),
                ],
            },
            include: EVENT_INCLUDE,
            orderBy: { schedule: 'asc' },
        });
    }
    async reportFraud(eventId, userId, reason, details) {
        const booking = await this.prisma.eventBooking.findUnique({
            where: {
                eventId_userId: { eventId, userId },
            },
        });
        if (!booking) {
            throw new common_1.ForbiddenException('You can only report events you have booked');
        }
        const report = await this.prisma.fraudReport.create({
            data: {
                eventId,
                userId,
                reason,
                details,
                status: 'pending',
            },
        });
        await this.prisma.event.update({
            where: { id: eventId },
            data: { payoutStatus: 'held' },
        });
        return report;
    }
    async createRazorpayOrder(id, userId) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.fees <= 0)
            throw new common_1.ConflictException('This event is free');
        const existing = await this.prisma.eventBooking.findUnique({
            where: { eventId_userId: { eventId: id, userId } },
        });
        if (existing)
            throw new common_1.ConflictException('Already booked');
        const order = await this.razorpayService.createOrder(event.fees, 'INR', `event_booking_${id}_${userId}`);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        };
    }
    async completeRazorpayBooking(id, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const isValid = this.razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) {
            throw new common_1.ForbiddenException('Invalid payment signature');
        }
        return this.prisma.eventBooking.create({
            data: {
                eventId: id,
                userId,
                paymentId: razorpayPaymentId,
                escrowStatus: 'held',
            },
            include: {
                event: {
                    select: { id: true, title: true, schedule: true, mode: true, fees: true },
                },
            },
        });
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        razorpay_service_1.RazorpayService])
], EventService);
//# sourceMappingURL=event.service.js.map