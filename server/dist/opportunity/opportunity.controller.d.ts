import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
export declare class OpportunityController {
    private readonly opportunityService;
    constructor(opportunityService: OpportunityService);
    create(req: any, dto: CreateOpportunityDto): Promise<{
        company: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mode: import(".prisma/client").$Enums.OpportunityMode;
        type: import(".prisma/client").$Enums.OpportunityType;
        payment: string | null;
        postName: string;
        registrationDeadline: Date | null;
    }>;
    findAll(): Promise<({
        company: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mode: import(".prisma/client").$Enums.OpportunityMode;
        type: import(".prisma/client").$Enums.OpportunityType;
        payment: string | null;
        postName: string;
        registrationDeadline: Date | null;
    })[]>;
    findAllByCompany(companyId: string): Promise<({
        company: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mode: import(".prisma/client").$Enums.OpportunityMode;
        type: import(".prisma/client").$Enums.OpportunityType;
        payment: string | null;
        postName: string;
        registrationDeadline: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        company: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mode: import(".prisma/client").$Enums.OpportunityMode;
        type: import(".prisma/client").$Enums.OpportunityType;
        payment: string | null;
        postName: string;
        registrationDeadline: Date | null;
    }>;
    update(id: string, req: any, dto: UpdateOpportunityDto): Promise<{
        company: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        status: import(".prisma/client").$Enums.OpportunityStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        mode: import(".prisma/client").$Enums.OpportunityMode;
        type: import(".prisma/client").$Enums.OpportunityType;
        payment: string | null;
        postName: string;
        registrationDeadline: Date | null;
    }>;
    remove(id: string, req: any): Promise<{
        ok: boolean;
    }>;
}
