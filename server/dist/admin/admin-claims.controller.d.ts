import { OwnershipClaimService } from '../ownership-claim/ownership-claim.service';
import { AdminDecideClaimDto } from '../ownership-claim/dto/admin-decide-claim.dto';
export declare class AdminClaimsController {
    private readonly claimService;
    constructor(claimService: OwnershipClaimService);
    getStats(): Promise<{
        pending: number;
        under_admin_review: number;
        approved_today: number;
        rejected_today: number;
        sla_breached: number;
    }>;
    listClaims(status?: string, page?: string, limit?: string): Promise<{
        data: ({
            company: {
                id: string;
                name: string;
                domain: string;
            };
            claimant: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            companyId: string;
            claimantId: string;
            status: import(".prisma/client").$Enums.ClaimStatus;
            verificationMethod: import(".prisma/client").$Enums.ClaimVerificationMethod | null;
            domainEmail: string | null;
            domainVerifiedAt: Date | null;
            authorizationLetterUrl: string | null;
            governmentIdUrl: string | null;
            documentVerifiedAt: Date | null;
            submittedGstin: string | null;
            submittedCin: string | null;
            gstNameMatch: boolean | null;
            gstValidatedAt: Date | null;
            adminDecision: string | null;
            adminNotes: string | null;
            adminReviewedAt: Date | null;
            adminReviewedBy: string | null;
            requestedRole: import(".prisma/client").$Enums.CompanyRoleType;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getClaimDetail(claimId: string): Promise<{
        company: {
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
        };
        claimant: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string;
        };
        domainVerificationToken: {
            id: string;
            createdAt: Date;
            email: string;
            claimId: string;
            otpHash: string;
            expiresAt: Date;
        };
    } & {
        id: string;
        companyId: string;
        claimantId: string;
        status: import(".prisma/client").$Enums.ClaimStatus;
        verificationMethod: import(".prisma/client").$Enums.ClaimVerificationMethod | null;
        domainEmail: string | null;
        domainVerifiedAt: Date | null;
        authorizationLetterUrl: string | null;
        governmentIdUrl: string | null;
        documentVerifiedAt: Date | null;
        submittedGstin: string | null;
        submittedCin: string | null;
        gstNameMatch: boolean | null;
        gstValidatedAt: Date | null;
        adminDecision: string | null;
        adminNotes: string | null;
        adminReviewedAt: Date | null;
        adminReviewedBy: string | null;
        requestedRole: import(".prisma/client").$Enums.CompanyRoleType;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    decide(req: any, claimId: string, dto: AdminDecideClaimDto): Promise<{
        status: string;
        role: any;
        companyId: any;
        message: string;
    } | {
        status: string;
        message: string;
    }>;
}
