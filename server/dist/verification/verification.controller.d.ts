import { VerificationService } from './verification.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ConsentDto } from './dto/consent.dto';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    startSession(req: any): Promise<{
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
    recordConsent(req: any, sessionId: string, body: ConsentDto): Promise<{
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
    uploadDocument(req: any, sessionId: string, body: UploadDocumentDto, files: {
        front?: Express.Multer.File[];
        back?: Express.Multer.File[];
    }): Promise<{
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
    captureFace(req: any, sessionId: string, file: Express.Multer.File): Promise<{
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
    getSessionStatus(req: any, sessionId: string): Promise<{
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
    getMyVerification(req: any): Promise<{
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
    retryVerification(req: any): Promise<{
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
    deleteVerificationData(req: any): Promise<{
        message: string;
    }>;
    getConsentInfo(): {
        required: boolean;
        disclosure: string[];
        dataProcessed: string[];
        retentionPolicy: string;
        rightsInfo: string;
    };
}
