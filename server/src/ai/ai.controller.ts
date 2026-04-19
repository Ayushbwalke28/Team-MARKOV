import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateCampaignDto, SuggestProfileImprovementsDto, ChatDto } from './dto/ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('profile/suggest')
  async suggestProfileImprovements(@Body() body: SuggestProfileImprovementsDto) {
    return this.aiService.suggestProfileImprovements(body.profileData);
  }

  @Post('campaign/generate')
  async generateCampaign(@Body() body: GenerateCampaignDto) {
    return this.aiService.generateCampaign(body.companyData, body.goal);
  }

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return this.aiService.chat(body.messages);
  }
}
