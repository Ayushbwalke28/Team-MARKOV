"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiVerificationService = void 0;
const common_1 = require("@nestjs/common");
let AiVerificationService = AiVerificationService_1 = class AiVerificationService {
    constructor() {
        this.logger = new common_1.Logger(AiVerificationService_1.name);
        this.hfToken = process.env.HUGGING_FACE_TOKEN;
        this.hfModel = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
        this.HF_API_URL = `https://api-inference.huggingface.co/models/${this.hfModel}/v1/chat/completions`;
    }
    isValidGstinFormat(gstin) {
        return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(gstin.toUpperCase());
    }
    isValidCinFormat(cin) {
        return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin.toUpperCase());
    }
    buildPrompt(payload) {
        const gstinStatus = payload.gstin
            ? this.isValidGstinFormat(payload.gstin)
                ? `${payload.gstin} (format: VALID)`
                : `${payload.gstin} (format: INVALID — does not match 15-char GSTIN pattern)`
            : 'NOT PROVIDED';
        const cinStatus = payload.cinNumber
            ? this.isValidCinFormat(payload.cinNumber)
                ? `${payload.cinNumber} (format: VALID)`
                : `${payload.cinNumber} (format: INVALID — does not match CIN pattern)`
            : 'NOT PROVIDED';
        return `You are a company KYC verification AI for an Indian business platform. Analyze the following company registration details and decide if the company should be verified.

Company Details:
- Name: ${payload.companyName}
- GSTIN: ${gstinStatus}
- CIN Number: ${cinStatus}
- Domain / Industry: ${payload.domain ?? 'Not specified'}
- Founded Year: ${payload.startYear ?? 'Not specified'}
- Document Type Submitted: ${payload.documentType ?? 'None'}
- Registration Document URL: ${payload.registrationDocumentUrl ?? 'NOT PROVIDED'}
- Incorporation Certificate URL: ${payload.incorporationCertUrl ?? 'NOT PROVIDED'}

Verification Rules:
1. GSTIN must be provided and follow the valid 15-character Indian GST format.
2. CIN number is strongly preferred; if missing, other documents must compensate.
3. At least one document URL (registration or incorporation certificate) must be present.
4. Invalid GSTIN format is grounds for rejection.
5. If confidence is between 0.6 and 0.79, recommend manual_review.
6. If confidence is 0.8 or above and all checks pass, recommend approved.
7. If critical fields are missing or invalid, recommend rejected.

Respond ONLY with a single valid JSON object, no other text:
{"verdict":"approved","reason":"Brief explanation","confidence":0.95}
Valid verdict values: "approved", "rejected", "manual_review"
Confidence must be a decimal between 0 and 1.`;
    }
    async analyzeCompany(payload) {
        if (!this.hfToken) {
            this.logger.warn('HUGGING_FACE_TOKEN not set – using format-based fallback verdict');
            return this.fallbackVerdict(payload);
        }
        const prompt = this.buildPrompt(payload);
        try {
            const response = await fetch(this.HF_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.hfToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.hfModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a strict KYC compliance AI. Always respond with only valid JSON. No markdown, no explanation, just the JSON object.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    max_tokens: 256,
                    temperature: 0.1,
                    stream: false,
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                this.logger.error(`HuggingFace API error: ${response.status} – ${errText}`);
                return this.fallbackVerdict(payload);
            }
            const data = await response.json();
            const rawContent = data?.choices?.[0]?.message?.content?.trim() ?? '';
            this.logger.debug(`AI raw response: ${rawContent}`);
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                this.logger.warn('AI response did not contain parseable JSON; using fallback');
                return this.fallbackVerdict(payload);
            }
            const parsed = JSON.parse(jsonMatch[0]);
            const verdict = parsed.verdict;
            if (!['approved', 'rejected', 'manual_review'].includes(verdict)) {
                this.logger.warn(`Unexpected verdict value "${verdict}"; using fallback`);
                return this.fallbackVerdict(payload);
            }
            return {
                verdict,
                reason: String(parsed.reason ?? 'No reason provided'),
                confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.5))),
            };
        }
        catch (err) {
            this.logger.error('Failed to call HuggingFace AI:', err);
            return this.fallbackVerdict(payload);
        }
    }
    fallbackVerdict(payload) {
        const gstinValid = payload.gstin
            ? this.isValidGstinFormat(payload.gstin)
            : false;
        const hasDocument = !!payload.registrationDocumentUrl || !!payload.incorporationCertUrl;
        if (!payload.gstin) {
            return {
                verdict: 'rejected',
                reason: 'GSTIN is required for company verification',
                confidence: 0.95,
            };
        }
        if (!gstinValid) {
            return {
                verdict: 'rejected',
                reason: `GSTIN "${payload.gstin}" does not match the required 15-character Indian GST format`,
                confidence: 0.95,
            };
        }
        if (!hasDocument) {
            return {
                verdict: 'rejected',
                reason: 'At least one legal document (registration doc or incorporation certificate) must be provided',
                confidence: 0.9,
            };
        }
        return {
            verdict: 'manual_review',
            reason: 'AI service unavailable – format checks passed, flagged for manual review',
            confidence: 0.65,
        };
    }
};
exports.AiVerificationService = AiVerificationService;
exports.AiVerificationService = AiVerificationService = AiVerificationService_1 = __decorate([
    (0, common_1.Injectable)()
], AiVerificationService);
//# sourceMappingURL=ai-verification.service.js.map