import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface VerificationEvent {
  event: string;
  sessionId: string;
  userId: string;
  status: string;
  confidence?: number;
  reason?: string;
  timestamp: string;
}

@Injectable()
export class VerificationEventsService {
  private readonly logger = new Logger(VerificationEventsService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(eventName: string, payload: Omit<VerificationEvent, 'event' | 'timestamp'>) {
    const event: VerificationEvent = {
      event: eventName,
      ...payload,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`Emitting ${eventName} for session ${payload.sessionId}`);
    this.eventEmitter.emit(eventName, event);

    // Deliver webhook if configured
    this.deliverWebhook(event).catch((err) =>
      this.logger.warn(`Webhook delivery failed for ${eventName}`, err),
    );
  }

  private async deliverWebhook(event: VerificationEvent): Promise<void> {
    const webhookUrl = process.env.VERIFICATION_WEBHOOK_URL;
    if (!webhookUrl) return;

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
    } catch (error) {
      this.logger.error(`Webhook delivery error: ${error}`);
    }
  }
}
