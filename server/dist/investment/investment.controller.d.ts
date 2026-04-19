import { InvestmentService } from './investment.service';
export declare class InvestmentController {
    private readonly investmentService;
    constructor(investmentService: InvestmentService);
    createCompanyProfile(req: any, companyId: string, body: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        fundingStage: string | null;
        askAmount: number | null;
        pitchDeckUrl: string | null;
        financialsUrl: string | null;
        isVerified: boolean;
    }>;
    createInvestorProfile(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        accreditationStatus: string;
        investmentThesis: string | null;
        identityVerified: boolean;
        accreditationDocumentUrl: string | null;
        userId: string;
    }>;
    requestDealRoom(req: any, companyId: string): Promise<{
        id: string;
        companyId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        investorId: string;
        ndaSigned: boolean;
        ndaUrl: string | null;
        videoMeetingStatus: string;
        brokerFlagged: boolean;
        brokerReportReason: string | null;
    }>;
    signNda(req: any, dealRoomId: string, ndaUrl: string): Promise<{
        id: string;
        companyId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        investorId: string;
        ndaSigned: boolean;
        ndaUrl: string | null;
        videoMeetingStatus: string;
        brokerFlagged: boolean;
        brokerReportReason: string | null;
    }>;
    getDealRoom(req: any, dealRoomId: string): Promise<{
        company: {
            investmentProfile: {
                id: string;
                companyId: string;
                createdAt: Date;
                updatedAt: Date;
                fundingStage: string | null;
                askAmount: number | null;
                pitchDeckUrl: string | null;
                financialsUrl: string | null;
                isVerified: boolean;
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
        };
        investor: {
            investorProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                accreditationStatus: string;
                investmentThesis: string | null;
                identityVerified: boolean;
                accreditationDocumentUrl: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            verified: boolean;
            email: string;
            passwordHash: string | null;
            googleId: string | null;
            refreshTokenHash: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        companyId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        investorId: string;
        ndaSigned: boolean;
        ndaUrl: string | null;
        videoMeetingStatus: string;
        brokerFlagged: boolean;
        brokerReportReason: string | null;
    }>;
    verifyAccreditation(req: any, documentUrl: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        accreditationStatus: string;
        investmentThesis: string | null;
        identityVerified: boolean;
        accreditationDocumentUrl: string | null;
        userId: string;
    }>;
    reportBroker(req: any, dealRoomId: string, reason: string): Promise<{
        id: string;
        companyId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        investorId: string;
        ndaSigned: boolean;
        ndaUrl: string | null;
        videoMeetingStatus: string;
        brokerFlagged: boolean;
        brokerReportReason: string | null;
    }>;
}
