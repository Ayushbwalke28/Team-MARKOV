import { Injectable, Logger } from '@nestjs/common';

export interface AiVerdict {
  verdict: 'approved' | 'rejected' | 'manual_review';
  reason: string;
  confidence: number;
}

export interface CompanyKycPayload {
  companyName: string;
  gstin: string | null;
  cinNumber: string | null;
  registrationDocumentUrl: string | null;
  incorporationCertUrl: string | null;
  documentType: string | null;
  startYear: number | null;
  domain: string | null;
}

@Injectable()
export class AiVerificationService {
  private readonly logger = new Logger(AiVerificationService.name);

  private readonly hfToken = process.env.HUGGING_FACE_TOKEN;
  private readonly hfModel = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  private readonly HF_API_URL = `https://api-inference.huggingface.co/models/${this.hfModel}/v1/chat/completions`;

  /**
   * Validate GSTIN format: 15-character alphanumeric following the pattern
   * <2-digit state code><10-char PAN><1-digit entity code><Z><1-digit checksum>
   */
  private isValidGstinFormat(gstin: string): boolean {
    return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(gstin.toUpperCase());
  }

  /**
   * Validate CIN format: U/L + 5 digits + 2-letter state + 4-digit year + PTC/PVT/etc + 6-digit number
   */
  private isValidCinFormat(cin: string): boolean {
    return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin.toUpperCase());
  }

  /**
   * Build the structured KYC prompt for the LLM.
   */
  private buildPrompt(payload: CompanyKycPayload): string {
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

  /**
   * Call the HuggingFace Inference API and parse the AI verdict.
   */
  async analyzeCompany(payload: CompanyKycPayload): Promise<AiVerdict> {
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
              content:
                'You are a strict KYC compliance AI. Always respond with only valid JSON. No markdown, no explanation, just the JSON object.',
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
      const rawContent: string =
        data?.choices?.[0]?.message?.content?.trim() ?? '';

      this.logger.debug(`AI raw response: ${rawContent}`);

      // Extract JSON from response (handle possible markdown wrapping)
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
    } catch (err) {
      this.logger.error('Failed to call HuggingFace AI:', err);
      return this.fallbackVerdict(payload);
    }
  }

  /**
   * Format-only fallback when AI is unavailable.
   * Approves only if GSTIN is valid and at least one document URL exists.
   */
  private fallbackVerdict(payload: CompanyKycPayload): AiVerdict {
    const gstinValid = payload.gstin
      ? this.isValidGstinFormat(payload.gstin)
      : false;

    const hasDocument =
      !!payload.registrationDocumentUrl || !!payload.incorporationCertUrl;

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
}
