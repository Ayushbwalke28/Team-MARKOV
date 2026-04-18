import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface DocumentValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isBlurry: boolean;
  isTampered: boolean;
  issues: string[];
}

const BLUR_THRESHOLD = 100;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

@Injectable()
export class DocumentValidatorService {
  private readonly logger = new Logger(DocumentValidatorService.name);

  async validateDocument(
    parsedDoc: { idNumber: string | null; expiry: string | null },
    imageBuffer: Buffer,
    documentType: string,
  ): Promise<DocumentValidationResult> {
    const issues: string[] = [];
    let isExpired = false;
    let isBlurry = false;
    let isTampered = false;

    if (parsedDoc.expiry) {
      isExpired = this.isDocumentExpired(parsedDoc.expiry);
      if (isExpired) issues.push('Document appears to be expired');
    }

    if (parsedDoc.idNumber) {
      if (!this.validateIdNumberFormat(parsedDoc.idNumber, documentType)) {
        issues.push(`ID number does not match expected format for ${documentType}`);
      }
    } else {
      issues.push('Could not extract ID number from document');
    }

    try {
      isBlurry = await this.isImageBlurry(imageBuffer);
      if (isBlurry) issues.push('Document image appears blurry or low quality');
    } catch (e) { this.logger.warn('Blur detection failed', e); }

    try {
      if (!(await this.checkMinDimensions(imageBuffer))) {
        issues.push('Document image is too small or may be cropped');
      }
    } catch (e) { this.logger.warn('Dimension check failed', e); }

    try {
      isTampered = await this.detectTampering(imageBuffer);
      if (isTampered) issues.push('Document shows signs of possible manipulation');
    } catch (e) { this.logger.warn('Tamper detection failed', e); }

    const isValid = !isExpired && !isBlurry && !isTampered && issues.length === 0;
    return { isValid, isExpired, isBlurry, isTampered, issues };
  }

  isDocumentExpired(expiryDateStr: string): boolean {
    try {
      const expiry = new Date(expiryDateStr);
      if (isNaN(expiry.getTime())) return false;
      return expiry < new Date();
    } catch { return false; }
  }

  validateIdNumberFormat(idNumber: string, documentType: string): boolean {
    const patterns: Record<string, RegExp> = {
      aadhaar: /^\d{12}$/,
      pan_card: /^[A-Z]{5}\d{4}[A-Z]$/,
      passport: /^[A-Z]\d{7}$/,
      drivers_license: /^[A-Z]{2}\d{2}\d{4}\d{7}$/,
      national_id: /^[A-Z0-9]{6,20}$/,
    };
    const pattern = patterns[documentType];
    if (!pattern) return true;
    return pattern.test(idNumber);
  }

  async isImageBlurry(imageBuffer: Buffer): Promise<boolean> {
    const { data, info } = await sharp(imageBuffer)
      .grayscale().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    if (width < 10 || height < 10) return true;

    let sum = 0, sumSq = 0, count = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const lap = 4 * data[idx] - data[(y-1)*width+x] - data[(y+1)*width+x] - data[y*width+(x-1)] - data[y*width+(x+1)];
        sum += lap; sumSq += lap * lap; count++;
      }
    }
    if (count === 0) return true;
    const mean = sum / count;
    const variance = sumSq / count - mean * mean;
    return variance < BLUR_THRESHOLD;
  }

  async checkMinDimensions(imageBuffer: Buffer): Promise<boolean> {
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) return false;
    return metadata.width >= MIN_WIDTH && metadata.height >= MIN_HEIGHT;
  }

  async detectTampering(imageBuffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (metadata.format === 'jpeg' && metadata.size) {
        const pixels = (metadata.width || 1) * (metadata.height || 1);
        const bpp = (metadata.size * 8) / pixels;
        if (bpp < 0.5) return true;
      }
      return false;
    } catch { return false; }
  }
}
