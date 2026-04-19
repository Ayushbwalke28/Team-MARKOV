import { OrganizerType, EventMode } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    description?: string;
    category?: string;
    organizerType: OrganizerType;
    schedule: string;
    fees?: number;
    mode: EventMode;
    venue?: string;
    onlinePlatform?: string;
}
