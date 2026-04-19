import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SuggestProfileImprovementsDto {
  @IsObject()
  @IsNotEmpty()
  profileData: any;
}

export class GenerateCampaignDto {
  @IsObject()
  @IsNotEmpty()
  companyData: any;

  @IsString()
  @IsNotEmpty()
  goal: string;
}

export class ChatDto {
  @IsNotEmpty()
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}
