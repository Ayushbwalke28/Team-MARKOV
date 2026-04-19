"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const inference_1 = require("@huggingface/inference");
let AiService = AiService_1 = class AiService {
    constructor() {
        this.logger = new common_1.Logger(AiService_1.name);
        this.hf = new inference_1.HfInference(process.env.HUGGING_FACE_TOKEN);
        this.model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
    }
    async suggestProfileImprovements(profileData) {
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
        }
        catch (error) {
            this.logger.error('Error in suggestProfileImprovements', error);
            throw error;
        }
    }
    async generateCampaign(companyData, goal) {
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
        }
        catch (error) {
            this.logger.error('Error in generateCampaign', error);
            throw error;
        }
    }
    async chat(messages) {
        try {
            const response = await this.hf.chatCompletion({
                model: this.model,
                messages,
                max_tokens: 1000,
                temperature: 0.7,
            });
            return { content: response.choices[0].message.content };
        }
        catch (error) {
            this.logger.error('Error in chat', error);
            throw error;
        }
    }
    parseJsonResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(content);
        }
        catch (error) {
            this.logger.error('Failed to parse JSON response from LLM', content);
            return { error: 'Failed to parse AI response', raw: content };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map