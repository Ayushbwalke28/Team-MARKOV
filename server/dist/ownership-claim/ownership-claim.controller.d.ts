import { OwnershipClaimService } from './ownership-claim.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { SendDomainOtpDto } from './dto/send-domain-otp.dto';
import { VerifyDomainOtpDto } from './dto/verify-domain-otp.dto';
import { UploadClaimDocumentDto } from './dto/upload-claim-document.dto';
import { GstValidateDto } from './dto/gst-validate.dto';
export declare class OwnershipClaimController {
    private readonly claimService;
    constructor(claimService: OwnershipClaimService);
    create(req: any, dto: CreateClaimDto): Promise<{
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
    getMyClaims(req: any): Promise<({
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
    getDetail(req: any, claimId: string): Promise<{
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
    withdraw(req: any, claimId: string): Promise<{
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
    sendDomainOtp(req: any, claimId: string, dto: SendDomainOtpDto): Promise<{
        message: string;
    }>;
    verifyDomainOtp(req: any, claimId: string, dto: VerifyDomainOtpDto): Promise<{
        status: string;
        role: any;
        companyId: any;
        message: string;
    }>;
    uploadDocuments(req: any, claimId: string, dto: UploadClaimDocumentDto): Promise<{
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
    validateGstin(req: any, claimId: string, dto: GstValidateDto): Promise<{
        status: string;
        gstResult: import("./gst-crosscheck.service").GstCheckResult;
        message: string;
    }>;
    requestAdminReview(req: any, claimId: string): Promise<{
        status: string;
        message: string;
    }>;
}
