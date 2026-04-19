export interface AiVerdict {
    verdict: 'approved' | 'rejected' | 'manual_review';
    reason: string;
    confidence: number;
}
export interface CompanyKycPayload {
    companyName: string;
    gstin: string | null;
    cinNumber: string | null;
    registrationDocumentUrl: string | null;
    incorporationCertUrl: string | null;
    documentType: string | null;
    startYear: number | null;
    domain: string | null;
}
export declare class AiVerificationService {
    private readonly logger;
    private readonly hfToken;
    private readonly hfModel;
    private readonly HF_API_URL;
    private isValidGstinFormat;
    private isValidCinFormat;
    private buildPrompt;
    analyzeCompany(payload: CompanyKycPayload): Promise<AiVerdict>;
    private fallbackVerdict;
}
