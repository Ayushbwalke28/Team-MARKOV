import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from './ocr.service';
import { DocumentValidatorService } from './document-validator.service';
import { FaceService } from './face.service';
import { VerificationEventsService } from './verification-events.service';
export declare class VerificationService {
    private prisma;
    private ocrService;
    private documentValidator;
    private faceService;
    private events;
    private readonly logger;
    private idImageBuffers;
    constructor(prisma: PrismaService, ocrService: OcrService, documentValidator: DocumentValidatorService, faceService: FaceService, events: VerificationEventsService);
    startSession(userId: string): Promise<{
        id: any;
        status: any;
        documentType: any;
        confidenceScore: any;
        failureReason: any;
        attemptNumber: any;
        consentGiven: any;
        createdAt: any;
        updatedAt: any;
    }>;
    recordConsent(sessionId: string, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.VerificationStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        documentType: import(".prisma/client").$Enums.DocumentType | null;
        documentValid: boolean | null;
        failureReason: string | null;
        ocrName: string | null;
        ocrDob: string | null;
        ocrIdNumber: string | null;
        ocrExpiry: string | null;
        ocrAddress: string | null;
        documentExpired: boolean | null;
        documentBlurry: boolean | null;
        documentTampered: boolean | null;
        faceMatchScore: number | null;
        livenessPass: boolean | null;
        confidenceScore: number | null;
        attemptNumber: number;
        consentGiven: boolean;
        consentTimestamp: Date | null;
        rawDataDeletedAt: Date | null;
    }>;
    uploadDocument(sessionId: string, userId: string, documentType: string, frontBuffer: Buffer, backBuffer?: Buffer): Promise<{
        session: {
            id: any;
            status: any;
            documentType: any;
            confidenceScore: any;
            failureReason: any;
            attemptNumber: any;
            consentGiven: any;
            createdAt: any;
            updatedAt: any;
        };
        ocrData: {
            name: string;
            dob: string;
            idNumber: string;
            expiry: string;
            address: string;
        };
        validation: {
            isValid: boolean;
            issues: string[];
        };
    }>;
    captureFace(sessionId: string, userId: string, selfieBuffer: Buffer): Promise<{
        session: {
            id: any;
            status: any;
            documentType: any;
            confidenceScore: any;
            failureReason: any;
            attemptNumber: any;
            consentGiven: any;
            createdAt: any;
            updatedAt: any;
        };
        result: {
            status: string;
            confidence: number;
            livenessPass: boolean;
            reason: string;
        };
    }>;
    getSessionStatus(sessionId: string, userId: string): Promise<{
        id: any;
        status: any;
        documentType: any;
        confidenceScore: any;
        failureReason: any;
        attemptNumber: any;
        consentGiven: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getUserVerificationStatus(userId: string): Promise<{
        id: any;
        status: any;
        documentType: any;
        confidenceScore: any;
        failureReason: any;
        attemptNumber: any;
        consentGiven: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteUserData(userId: string): Promise<{
        message: string;
    }>;
    private getSession;
    private formatSession;
    private maskIdNumber;
}
