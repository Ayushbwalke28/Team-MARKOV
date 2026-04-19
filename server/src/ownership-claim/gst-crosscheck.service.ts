import { Injectable, Logger } from '@nestjs/common';

export interface GstApiResponse {
  lgnm: string;    // legal name
  tradeNam: string; // trade name
  sts: string;     // status (should be "Active")
  rgdt: string;    // registration date
  pradr?: { addr?: { stcd?: string } };
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

@Injectable()
export class GstCrosscheckService {
  private readonly logger = new Logger(GstCrosscheckService.name);

  private readonly GST_API_BASE =
    process.env.GST_API_BASE_URL || 'https://api.gst.gov.in/commonapi';
  private readonly NAME_MATCH_THRESHOLD = Number(
    process.env.CLAIM_NAME_MATCH_THRESHOLD || 0.8,
  );

  /** Validates the GSTIN format: 15-char Indian GST number */
  isValidGstinFormat(gstin: string): boolean {
    return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(
      gstin.toUpperCase(),
    );
  }

  /** Validates CIN format */
  isValidCinFormat(cin: string): boolean {
    return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin.toUpperCase());
  }

  /**
   * Cross-checks the company name against the GST API's registered name.
   * Falls back to format-only check if the API is unavailable.
   */
  async crossCheckGstin(gstin: string, companyName: string): Promise<GstCheckResult> {
    if (!this.isValidGstinFormat(gstin)) {
      return {
        valid: false,
        nameMatch: false,
        active: false,
        reason: `Invalid GSTIN format: "${gstin}" does not match the 15-character Indian GST pattern`,
      };
    }

    try {
      const apiKey = process.env.GST_API_KEY;
      const url = `${this.GST_API_BASE}/search?gstin=${gstin.toUpperCase()}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        this.logger.warn(`GST API returned ${response.status} – using format-only check`);
        return this.formatOnlyResult(gstin);
      }

      const data: GstApiResponse = await response.json();

      const active = data.sts?.toLowerCase() === 'active';
      const legalName = data.lgnm ?? '';
      const tradeName = data.tradeNam ?? '';

      const nameMatchScore = Math.max(
        this.tokenOverlapScore(legalName, companyName),
        this.tokenOverlapScore(tradeName, companyName),
      );

      const nameMatch = nameMatchScore >= this.NAME_MATCH_THRESHOLD;

      this.logger.log(
        `GST check for "${companyName}" vs GSTIN ${gstin}: nameMatch=${nameMatch} (score=${nameMatchScore.toFixed(2)}), active=${active}`,
      );

      return {
        valid: true,
        nameMatch,
        active,
        legalName,
        tradeName,
        status: data.sts,
        registrationDate: data.rgdt,
        reason: nameMatch
          ? `Name matched (score: ${(nameMatchScore * 100).toFixed(0)}%)`
          : `Name mismatch – GSTIN registered to "${legalName}" (score: ${(nameMatchScore * 100).toFixed(0)}%)`,
      };
    } catch (err) {
      this.logger.error('GST API call failed:', err);
      return this.formatOnlyResult(gstin);
    }
  }

  /** Token-based overlap score between two strings (0–1) */
  private tokenOverlapScore(a: string, b: string): number {
    const tokenize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

    const tokensA = new Set(tokenize(a));
    const tokensB = new Set(tokenize(b));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let overlap = 0;
    tokensA.forEach((t) => { if (tokensB.has(t)) overlap++; });

    return overlap / Math.max(tokensA.size, tokensB.size);
  }

  /** Used when the GST API is unavailable – only format validation */
  private formatOnlyResult(gstin: string): GstCheckResult {
    return {
      valid: true,
      nameMatch: false,
      active: false,
      reason:
        'GST API unavailable – format is valid but name match could not be confirmed. Escalated to admin review.',
    };
  }
}
