import { CompanyService } from './company.service';
import { MediaService } from '../media/media.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyController {
    private readonly companyService;
    private readonly mediaService;
    constructor(companyService: CompanyService, mediaService: MediaService);
    create(req: any, body: CreateCompanyDto): Promise<{
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
    findMine(req: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, req: any, body: UpdateCompanyDto): Promise<{
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
    remove(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    uploadLogo(id: string, req: any, file: Express.Multer.File): Promise<{
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
    getTrustProfile(id: string): Promise<{
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
    addFundingRound(id: string, req: any, body: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        date: Date;
        stage: string;
        amount: number;
        investors: string[];
    }>;
}
