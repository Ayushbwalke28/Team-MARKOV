import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Simulates creating a payment intent to hold funds in escrow.
   */
  async holdFundsInEscrow(eventId: string, userId: string, amount: number) {
    this.logger.log(`[Stripe Mock] Holding funds in escrow: $${amount} for Event ${eventId} by User ${userId}`);
    // Simulate generating a Stripe PaymentIntent ID
    return `pi_mock_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Simulates releasing funds from escrow to the organizer's connected account.
   */
  async releaseEscrowPayout(eventId: string, organizerId: string, amount: number) {
    this.logger.log(`[Stripe Mock] Releasing $${amount} from escrow to Organizer ${organizerId} for Event ${eventId}`);
    // In reality, this would use stripe.transfers.create to the connected account
    return true;
  }

  /**
   * Simulates refunding a specific booking.
   */
  async refundBooking(paymentId: string) {
    this.logger.log(`[Stripe Mock] Processing refund for Payment ID ${paymentId}`);
    return true;
  }

  /**
   * Automatically process payouts for an event if it's completed and no active fraud reports
   */
  async processEventPayout(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { bookings: true, fraudReports: true },
    });

    if (!event) return;

    const hasUnresolvedFraud = event.fraudReports.some(report => report.status !== 'resolved');
    if (hasUnresolvedFraud) {
      this.logger.warn(`Event ${eventId} has unresolved fraud reports. Payout on hold.`);
      return false;
    }

    const totalCollected = event.bookings.reduce((sum, booking) => sum + event.fees, 0);
    
    // Release funds
    await this.releaseEscrowPayout(eventId, event.organizerUserId || event.organizerCompanyId, totalCollected);

    // Update Event payout status
    await this.prisma.event.update({
      where: { id: eventId },
      data: { payoutStatus: 'released' },
    });

    // Update Bookings
    await this.prisma.eventBooking.updateMany({
      where: { eventId },
      data: { escrowStatus: 'released' },
    });

    return true;
  }
}
