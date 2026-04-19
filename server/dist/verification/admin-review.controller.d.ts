import { AdminReviewService } from './admin-review.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';
export declare class AdminReviewController {
    private readonly adminReviewService;
    constructor(adminReviewService: AdminReviewService);
    getQueue(status?: string, page?: string, limit?: string): Promise<{
        items: ({
            verificationSession: {
                id: string;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                userId: string;
                documentType: import(".prisma/client").$Enums.DocumentType;
                faceMatchScore: number;
                livenessPass: boolean;
                confidenceScore: number;
                attemptNumber: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reason: string;
            verificationSessionId: string;
            reviewedBy: string | null;
            reviewDecision: string | null;
            reviewNotes: string | null;
            reviewedAt: Date | null;
            slaDeadline: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getReviewDetail(reviewId: string): Promise<{
        verificationSession: {
            id: string;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            documentType: import(".prisma/client").$Enums.DocumentType;
            documentValid: boolean;
            failureReason: string;
            documentExpired: boolean;
            documentBlurry: boolean;
            documentTampered: boolean;
            faceMatchScore: number;
            livenessPass: boolean;
            confidenceScore: number;
            attemptNumber: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        verificationSessionId: string;
        reviewedBy: string | null;
        reviewDecision: string | null;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        slaDeadline: Date;
    }>;
    submitDecision(req: any, reviewId: string, body: ReviewDecisionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string;
        verificationSessionId: string;
        reviewedBy: string | null;
        reviewDecision: string | null;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        slaDeadline: Date;
    }>;
    getAuditLog(page?: string, limit?: string): Promise<{
        items: ({
            verificationSession: {
                id: string;
                userId: string;
                documentType: import(".prisma/client").$Enums.DocumentType;
                confidenceScore: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reason: string;
            verificationSessionId: string;
            reviewedBy: string | null;
            reviewDecision: string | null;
            reviewNotes: string | null;
            reviewedAt: Date | null;
            slaDeadline: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
