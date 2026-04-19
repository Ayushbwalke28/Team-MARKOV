import { Injectable, Logger } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private hf: HfInference;
  private model: string;

  constructor() {
    this.hf = new HfInference(process.env.HUGGING_FACE_TOKEN);
    this.model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  }

  async suggestProfileImprovements(profileData: any) {
    const systemPrompt = `You are an expert career coach and profile optimizer. Your goal is to review professional profiles and provide constructive, specific feedback to make them stand out to recruiters and investors.
    
    Format your response as a JSON object with the following structure:
    {
      "suggestions": ["string"],
      "rewrittenAbout": "string",
      "experienceEnhancements": [{"title": "string", "enhancedDescription": "string"}]
    }
    Ensure the response is a valid JSON.`;

    const userPrompt = `Please analyze the following profile data and provide 3 concrete suggestions for improvement, as well as a rewritten "About" section that is more engaging.

    Profile Data:
    ${JSON.stringify(profileData, null, 2)}`;

    try {
      const response = await this.hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return this.parseJsonResponse(content);
    } catch (error) {
      this.logger.error('Error in suggestProfileImprovements', error);
      throw error;
    }
  }

  async generateCampaign(companyData: any, goal: string) {
    const systemPrompt = `You are a B2B marketing expert. Create engaging social media campaigns for companies.
    
    Format your response as a JSON object with the following structure:
    {
      "campaigns": [
        {
          "type": "professional",
          "content": "string",
          "hashtags": ["string"]
        },
        {
          "type": "enthusiastic",
          "content": "string",
          "hashtags": ["string"]
        }
      ]
    }
    Ensure the response is a valid JSON.`;

    const userPrompt = `Company: ${JSON.stringify(companyData, null, 2)}
    Goal: ${goal}`;

    try {
      const response = await this.hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      });

      const content = response.choices[0].message.content;
      return this.parseJsonResponse(content);
    } catch (error) {
      this.logger.error('Error in generateCampaign', error);
      throw error;
    }
  }

  async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
    try {
      const response = await this.hf.chatCompletion({
        model: this.model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return { content: response.choices[0].message.content };
    } catch (error) {
      this.logger.error('Error in chat', error);
      throw error;
    }
  }

  private parseJsonResponse(content: string) {
    try {
      // Find JSON block if LLM returned extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to parse JSON response from LLM', content);
      return { error: 'Failed to parse AI response', raw: content };
    }
  }
}
