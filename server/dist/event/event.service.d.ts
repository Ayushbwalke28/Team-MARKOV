import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { StripeService } from '../payments/stripe/stripe.service';
import { RazorpayService } from '../payments/razorpay/razorpay.service';
export declare class EventService {
    private readonly prisma;
    private readonly stripeService;
    private readonly razorpayService;
    constructor(prisma: PrismaService, stripeService: StripeService, razorpayService: RazorpayService);
    create(userId: string, dto: CreateEventDto): Promise<{
        _count: {
            bookings: number;
        };
        organizerUser: {
            id: string;
            name: string;
        };
        organizerCompany: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            bookings: number;
        };
        organizerUser: {
            id: string;
            name: string;
        };
        organizerCompany: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    })[]>;
    findById(id: string): Promise<{
        _count: {
            bookings: number;
        };
        organizerUser: {
            id: string;
            name: string;
        };
        organizerCompany: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    }>;
    private verifyOwnership;
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        _count: {
            bookings: number;
        };
        organizerUser: {
            id: string;
            name: string;
        };
        organizerCompany: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    }>;
    setBanner(eventId: string, userId: string, bannerUrl: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    bookEvent(id: string, userId: string): Promise<{
        event: {
            id: string;
            mode: import(".prisma/client").$Enums.EventMode;
            title: string;
            schedule: Date;
            fees: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentId: string | null;
        escrowStatus: import(".prisma/client").$Enums.EscrowStatus;
        checkInStatus: import(".prisma/client").$Enums.CheckInStatus;
        refundStatus: string | null;
        eventId: string;
    }>;
    cancelBooking(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    getBookings(id: string, userId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentId: string | null;
        escrowStatus: import(".prisma/client").$Enums.EscrowStatus;
        checkInStatus: import(".prisma/client").$Enums.CheckInStatus;
        refundStatus: string | null;
        eventId: string;
    })[]>;
    getMyBookings(userId: string): Promise<({
        event: {
            _count: {
                bookings: number;
            };
            organizerUser: {
                id: string;
                name: string;
            };
            organizerCompany: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.EventStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            trustScore: number | null;
            bannerUrl: string | null;
            mode: import(".prisma/client").$Enums.EventMode;
            title: string;
            category: string | null;
            organizerType: import(".prisma/client").$Enums.OrganizerType;
            schedule: Date;
            fees: number;
            venue: string | null;
            onlinePlatform: string | null;
            payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
            organizerUserId: string | null;
            organizerCompanyId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentId: string | null;
        escrowStatus: import(".prisma/client").$Enums.EscrowStatus;
        checkInStatus: import(".prisma/client").$Enums.CheckInStatus;
        refundStatus: string | null;
        eventId: string;
    })[]>;
    getMyEvents(userId: string): Promise<({
        _count: {
            bookings: number;
        };
        organizerUser: {
            id: string;
            name: string;
        };
        organizerCompany: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        trustScore: number | null;
        bannerUrl: string | null;
        mode: import(".prisma/client").$Enums.EventMode;
        title: string;
        category: string | null;
        organizerType: import(".prisma/client").$Enums.OrganizerType;
        schedule: Date;
        fees: number;
        venue: string | null;
        onlinePlatform: string | null;
        payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
        organizerUserId: string | null;
        organizerCompanyId: string | null;
    })[]>;
    reportFraud(eventId: string, userId: string, reason: string, details?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        userId: string;
        eventId: string;
        details: string | null;
    }>;
    createRazorpayOrder(id: string, userId: string): Promise<{
        orderId: any;
        amount: any;
        currency: any;
        key: string;
    }>;
    completeRazorpayBooking(id: string, userId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<{
        event: {
            id: string;
            mode: import(".prisma/client").$Enums.EventMode;
            title: string;
            schedule: Date;
            fees: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentId: string | null;
        escrowStatus: import(".prisma/client").$Enums.EscrowStatus;
        checkInStatus: import(".prisma/client").$Enums.CheckInStatus;
        refundStatus: string | null;
        eventId: string;
    }>;
}
