export interface DocumentValidationResult {
    isValid: boolean;
    isExpired: boolean;
    isBlurry: boolean;
    isTampered: boolean;
    issues: string[];
}
export declare class DocumentValidatorService {
    private readonly logger;
    validateDocument(parsedDoc: {
        idNumber: string | null;
        expiry: string | null;
    }, imageBuffer: Buffer, documentType: string): Promise<DocumentValidationResult>;
    isDocumentExpired(expiryDateStr: string): boolean;
    validateIdNumberFormat(idNumber: string, documentType: string): boolean;
    isImageBlurry(imageBuffer: Buffer): Promise<boolean>;
    checkMinDimensions(imageBuffer: Buffer): Promise<boolean>;
    detectTampering(imageBuffer: Buffer): Promise<boolean>;
}
