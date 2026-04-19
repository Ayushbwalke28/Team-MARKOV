import { PrismaService } from '../prisma/prisma.service';
import { VerificationEventsService } from './verification-events.service';
export declare class AdminReviewService {
    private prisma;
    private events;
    private readonly logger;
    constructor(prisma: PrismaService, events: VerificationEventsService);
    getQueue(filters: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    submitDecision(reviewId: string, adminId: string, decision: 'approved' | 'rejected', notes?: string): Promise<{
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
    getAuditLog(filters: {
        page?: number;
        limit?: number;
    }): Promise<{
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
