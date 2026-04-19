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
export declare class VerificationEventsService {
    private readonly eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    emit(eventName: string, payload: Omit<VerificationEvent, 'event' | 'timestamp'>): void;
    private deliverWebhook;
}
