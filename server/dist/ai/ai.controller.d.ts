import { AiService } from './ai.service';
import { GenerateCampaignDto, SuggestProfileImprovementsDto, ChatDto } from './dto/ai.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    suggestProfileImprovements(body: SuggestProfileImprovementsDto): Promise<any>;
    generateCampaign(body: GenerateCampaignDto): Promise<any>;
    chat(body: ChatDto): Promise<{
        content: string;
    }>;
}
