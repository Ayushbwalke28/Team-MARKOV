import { OpportunityType, OpportunityMode, OpportunityStatus } from '@prisma/client';
export declare class UpdateOpportunityDto {
    type?: OpportunityType;
    mode?: OpportunityMode;
    status?: OpportunityStatus;
    payment?: string;
    postName?: string;
    description?: string;
    registrationDeadline?: string;
}
