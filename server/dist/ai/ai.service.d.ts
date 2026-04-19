export declare class AiService {
    private readonly logger;
    private hf;
    private model;
    constructor();
    suggestProfileImprovements(profileData: any): Promise<any>;
    generateCampaign(companyData: any, goal: string): Promise<any>;
    chat(messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[]): Promise<{
        content: string;
    }>;
    private parseJsonResponse;
}
