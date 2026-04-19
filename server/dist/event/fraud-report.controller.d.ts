import { EventService } from './event.service';
import { ReportFraudDto } from './dto/report-fraud.dto';
export declare class FraudReportController {
    private readonly eventService;
    constructor(eventService: EventService);
    reportFraud(eventId: string, req: any, dto: ReportFraudDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        userId: string;
        eventId: string;
        details: string | null;
    }>;
}
