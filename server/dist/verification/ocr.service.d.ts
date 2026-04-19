export interface ParsedDocument {
    name: string | null;
    dob: string | null;
    idNumber: string | null;
    expiry: string | null;
    address: string | null;
    rawText: string;
}
export declare class OcrService {
    private readonly logger;
    private worker;
    private getWorker;
    extractText(imageBuffer: Buffer): Promise<string>;
    parseDocument(text: string, documentType: string): ParsedDocument;
    private extractDates;
    private extractName;
    private extractAddress;
    validateIdFormat(idNumber: string, documentType: string): boolean;
    onModuleDestroy(): Promise<void>;
}
