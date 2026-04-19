import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyService {
    private readonly prisma;
    private readonly usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    create(ownerId: string, dto: CreateCompanyDto): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    }>;
    findAll(): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    })[]>;
    findById(id: string): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    }>;
    findByOwner(ownerId: string): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    }>;
    update(id: string, requesterId: string, dto: UpdateCompanyDto): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    }>;
    setLogo(companyId: string, userId: string, logoUrl: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        location: string | null;
        startYear: number | null;
        description: string | null;
        size: string | null;
        domain: string | null;
        websiteDomain: string | null;
        logoUrl: string | null;
        verificationStatus: import(".prisma/client").$Enums.CompanyVerificationStatus;
        taxId: string | null;
        registrationDocumentUrl: string | null;
        incorporationCertUrl: string | null;
        gstin: string | null;
        cinNumber: string | null;
        verifiedAt: Date | null;
        trustScore: number | null;
    }>;
    remove(id: string, requesterId: string): Promise<{
        ok: boolean;
    }>;
    getTrustProfile(companyId: string): Promise<{
        companyId: string;
        name: string;
        verifiedBadge: boolean;
        trustScore: number;
        businessProofs: {
            domain: string;
            startYear: number;
            gstVerified: boolean;
            cinVerified: boolean;
        };
        fundingHistory: {
            id: string;
            companyId: string;
            createdAt: Date;
            date: Date;
            stage: string;
            amount: number;
            investors: string[];
        }[];
    }>;
    addFundingRound(companyId: string, userId: string, data: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        date: Date;
        stage: string;
        amount: number;
        investors: string[];
    }>;
}
