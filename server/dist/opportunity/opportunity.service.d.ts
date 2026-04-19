import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
export declare class OpportunityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(ownerId: string, dto: CreateOpportunityDto): Promise<{
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
    findById(id: string): Promise<{
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
    update(id: string, ownerId: string, dto: UpdateOpportunityDto): Promise<{
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
    remove(id: string, ownerId: string): Promise<{
        ok: boolean;
    }>;
}
