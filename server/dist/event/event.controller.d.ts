import { EventService } from './event.service';
import { MediaService } from '../media/media.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventController {
    private readonly eventService;
    private readonly mediaService;
    constructor(eventService: EventService, mediaService: MediaService);
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
    getMyEvents(req: any): Promise<({
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
    getMyBookings(req: any): Promise<({
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
    create(req: any, dto: CreateEventDto): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, req: any, dto: UpdateEventDto): Promise<{
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
    remove(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    bookEvent(id: string, req: any): Promise<{
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
    cancelBooking(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    getBookings(id: string, req: any): Promise<({
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
    createRazorpayOrder(id: string, req: any): Promise<{
        orderId: any;
        amount: any;
        currency: any;
        key: string;
    }>;
    verifyRazorpayPayment(id: string, req: any, body: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{
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
    uploadBanner(id: string, req: any, file: Express.Multer.File): Promise<{
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
}
