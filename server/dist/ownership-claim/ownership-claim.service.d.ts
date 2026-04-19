import { PrismaService } from '../prisma/prisma.service';
import { AiVerificationService } from '../company-verification/ai-verification.service';
import { DomainEmailVerificationService } from './domain-email-verification.service';
import { GstCrosscheckService } from './gst-crosscheck.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { AdminDecideClaimDto } from './dto/admin-decide-claim.dto';
export declare class OwnershipClaimService {
    private readonly prisma;
    private readonly aiVerification;
    private readonly domainEmail;
    private readonly gstCrosscheck;
    private readonly logger;
    constructor(prisma: PrismaService, aiVerification: AiVerificationService, domainEmail: DomainEmailVerificationService, gstCrosscheck: GstCrosscheckService);
    createClaim(userId: string, dto: CreateClaimDto): Promise<{
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
    sendDomainOtp(claimId: string, userId: string, email: string): Promise<{
        message: string;
    }>;
    verifyDomainOtp(claimId: string, userId: string, otp: string): Promise<{
        status: string;
        role: any;
        companyId: any;
        message: string;
    }>;
    uploadDocuments(claimId: string, userId: string, authorizationLetterUrl: string, governmentIdUrl?: string): Promise<{
        status: string;
        role: any;
        companyId: any;
        message: string;
    } | {
        status: string;
        message: string;
        aiReason: string;
        reason?: undefined;
    } | {
        status: string;
        message: string;
        reason: string;
        aiReason?: undefined;
    }>;
    validateGstin(claimId: string, userId: string, gstin: string, cinNumber?: string): Promise<{
        status: string;
        gstResult: import("./gst-crosscheck.service").GstCheckResult;
        message: string;
    }>;
    requestAdminReview(claimId: string, userId: string): Promise<{
        status: string;
        message: string;
    }>;
    getMyClaims(userId: string): Promise<({
        company: {
            id: string;
            name: string;
            domain: string;
            logoUrl: string;
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
    })[]>;
    getClaimDetail(claimId: string, userId: string): Promise<{
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
    withdrawClaim(claimId: string, userId: string): Promise<{
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
    adminListClaims(status?: string, page?: number, limit?: number): Promise<{
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
    adminGetClaimDetail(claimId: string): Promise<{
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
    adminGetStats(): Promise<{
        pending: number;
        under_admin_review: number;
        approved_today: number;
        rejected_today: number;
        sla_breached: number;
    }>;
    adminDecide(claimId: string, adminId: string, dto: AdminDecideClaimDto): Promise<{
        status: string;
        role: any;
        companyId: any;
        message: string;
    } | {
        status: string;
        message: string;
    }>;
    private getClaim;
    private assertClaimEditable;
    private escalateToAdminReview;
    private approveClaim;
}
