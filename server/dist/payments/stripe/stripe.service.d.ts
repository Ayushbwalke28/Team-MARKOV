import { PrismaService } from '../../prisma/prisma.service';
export declare class StripeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    holdFundsInEscrow(eventId: string, userId: string, amount: number): Promise<string>;
    releaseEscrowPayout(eventId: string, organizerId: string, amount: number): Promise<boolean>;
    refundBooking(paymentId: string): Promise<boolean>;
    processEventPayout(eventId: string): Promise<boolean>;
}
