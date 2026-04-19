export interface GstApiResponse {
    lgnm: string;
    tradeNam: string;
    sts: string;
    rgdt: string;
    pradr?: {
        addr?: {
            stcd?: string;
        };
    };
}
export interface GstCheckResult {
    valid: boolean;
    nameMatch: boolean;
    active: boolean;
    legalName?: string;
    tradeName?: string;
    status?: string;
    registrationDate?: string;
    reason?: string;
}
export declare class GstCrosscheckService {
    private readonly logger;
    private readonly GST_API_BASE;
    private readonly NAME_MATCH_THRESHOLD;
    isValidGstinFormat(gstin: string): boolean;
    isValidCinFormat(cin: string): boolean;
    crossCheckGstin(gstin: string, companyName: string): Promise<GstCheckResult>;
    private tokenOverlapScore;
    private formatOnlyResult;
}
