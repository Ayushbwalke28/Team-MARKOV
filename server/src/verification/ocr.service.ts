import { Injectable, Logger } from '@nestjs/common';

/**
 * Parsed document data extracted via OCR.
 */
export interface ParsedDocument {
  name: string | null;
  dob: string | null;
  idNumber: string | null;
  expiry: string | null;
  address: string | null;
  rawText: string;
}

/**
 * Regex patterns for different document types' ID numbers.
 */
const ID_NUMBER_PATTERNS: Record<string, RegExp> = {
  aadhaar: /\b\d{4}[ \t]?\d{4}[ \t]?\d{4}\b/,
  pan_card: /\b[A-Z]{5}\d{4}[A-Z]\b/,
  passport: /\b[A-Z]\d{7}\b/,
  drivers_license: /\b[A-Z]{2}\d{2}[ \t]?\d{4}[ \t]?\d{7}\b/,
  national_id: /\b[A-Z0-9]{6,20}\b/,
};

/**
 * Common date patterns found on ID documents.
 */
const DATE_PATTERNS = [
  /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/, // DD/MM/YYYY or DD-MM-YYYY
  /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/, // YYYY/MM/DD or YYYY-MM-DD
  /\b(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})\b/i, // DD Month YYYY
];

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: any = null;

  /**
   * Initialize tesseract.js worker lazily.
   */
  private async getWorker() {
    if (!this.worker) {
      const Tesseract = await import('tesseract.js');
      this.worker = await Tesseract.createWorker('eng');
    }
    return this.worker;
  }

  /**
   * Extract raw text from an image buffer using Tesseract OCR.
   */
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const worker = await this.getWorker();
      const { data } = await worker.recognize(imageBuffer);
      return data.text || '';
    } catch (error) {
      this.logger.error('OCR extraction failed', error);
      return '';
    }
  }

  /**
   * Parse extracted OCR text into structured document fields
   * based on the document type.
   */
  parseDocument(text: string, documentType: string): ParsedDocument {
    const result: ParsedDocument = {
      name: null,
      dob: null,
      idNumber: null,
      expiry: null,
      address: null,
      rawText: text,
    };

    // Extract ID number using type-specific pattern
    const idPattern = ID_NUMBER_PATTERNS[documentType];
    if (idPattern) {
      const idMatch = text.match(idPattern);
      if (idMatch) {
        result.idNumber = idMatch[0].replace(/\s/g, '');
      }
    }

    // Extract dates (first = DOB, second = expiry if present)
    const dates = this.extractDates(text);
    if (dates.length > 0) {
      result.dob = dates[0];
    }
    if (dates.length > 1) {
      result.expiry = dates[1];
    }

    // Extract name — heuristic: look for common label patterns
    result.name = this.extractName(text, documentType);

    // Extract address — heuristic: look for multi-line text after address labels
    result.address = this.extractAddress(text);

    return result;
  }

  /**
   * Extract all date-like strings from OCR text.
   */
  private extractDates(text: string): string[] {
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04',
      may: '05', jun: '06', jul: '07', aug: '08',
      sep: '09', oct: '10', nov: '11', dec: '12',
    };

    const dates: string[] = [];

    for (const pattern of DATE_PATTERNS) {
      const matches = text.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        const full = match[0];
        // Normalize to YYYY-MM-DD
        if (/^\d{4}/.test(full)) {
          dates.push(full.replace(/\//g, '-'));
        } else if (/\d{2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(full)) {
          const day = match[1];
          const month = months[match[2].toLowerCase().substring(0, 3)] || '01';
          const year = match[3];
          dates.push(`${year}-${month}-${day.padStart(2, '0')}`);
        } else {
          // DD/MM/YYYY → YYYY-MM-DD
          dates.push(`${match[3]}-${match[2]}-${match[1]}`);
        }
      }
    }

    return dates;
  }

  /**
   * Heuristic name extraction from OCR text.
   */
  private extractName(text: string, documentType: string): string | null {
    const namePatterns = [
      /(?:Name|Naam)[ \t]*[:\-]?[ \t]*([A-Z][A-Za-z ]{2,40})/i,
      /(?:Given[ \t]+Name|First[ \t]+Name|Surname)[ \t]*[:\-]?[ \t]*([A-Z][A-Za-z ]{2,40})/i,
    ];

    // Aadhaar-specific: name is typically on the 2nd-3rd line
    if (documentType === 'aadhaar') {
      const lines = text.split('\n').filter((l) => l.trim().length > 2);
      if (lines.length >= 2) {
        const candidateLine = lines[1].trim();
        if (/^[A-Z][a-zA-Z\s]{2,40}$/.test(candidateLine)) {
          return candidateLine;
        }
      }
    }

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Heuristic address extraction from OCR text.
   */
  private extractAddress(text: string): string | null {
    const addressPattern = /(?:Address|addr|S\/O|D\/O|W\/O|C\/O)\s*[:\-]?\s*([\s\S]{10,200}?)(?:\n\n|\d{6})/i;
    const match = text.match(addressPattern);
    if (match) {
      return match[1].replace(/\n/g, ', ').trim();
    }
    return null;
  }

  /**
   * Validate that an ID number matches the expected format for its document type.
   */
  validateIdFormat(idNumber: string, documentType: string): boolean {
    const pattern = ID_NUMBER_PATTERNS[documentType];
    if (!pattern) return true; // Unknown type — skip validation
    return pattern.test(idNumber);
  }

  /**
   * Cleanup tesseract worker on module destroy.
   */
  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
