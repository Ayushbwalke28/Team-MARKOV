export declare class SuggestProfileImprovementsDto {
    profileData: any;
}
export declare class GenerateCampaignDto {
    companyData: any;
    goal: string;
}
export declare class ChatDto {
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[];
}
