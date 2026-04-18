import { DocumentValidatorService } from './document-validator.service';

describe('DocumentValidatorService', () => {
  let service: DocumentValidatorService;

  beforeEach(() => {
    service = new DocumentValidatorService();
  });

  describe('isDocumentExpired', () => {
    it('should return true for past dates', () => {
      expect(service.isDocumentExpired('2020-01-01')).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(service.isDocumentExpired('2099-12-31')).toBe(false);
    });

    it('should return false for unparseable dates', () => {
      expect(service.isDocumentExpired('not-a-date')).toBe(false);
    });
  });

  describe('validateIdNumberFormat', () => {
    it('should validate correct Aadhaar format', () => {
      expect(service.validateIdNumberFormat('123456789012', 'aadhaar')).toBe(true);
    });

    it('should reject wrong Aadhaar format', () => {
      expect(service.validateIdNumberFormat('123', 'aadhaar')).toBe(false);
    });

    it('should validate correct PAN format', () => {
      expect(service.validateIdNumberFormat('ABCDE1234F', 'pan_card')).toBe(true);
    });

    it('should reject wrong PAN format', () => {
      expect(service.validateIdNumberFormat('ABCD1234', 'pan_card')).toBe(false);
    });

    it('should validate correct passport format', () => {
      expect(service.validateIdNumberFormat('A1234567', 'passport')).toBe(true);
    });

    it('should reject wrong passport format', () => {
      expect(service.validateIdNumberFormat('12345678', 'passport')).toBe(false);
    });

    it('should return true for unknown document type', () => {
      expect(service.validateIdNumberFormat('anything', 'unknown')).toBe(true);
    });
  });

  describe('isImageBlurry', () => {
    it('should detect a tiny image as blurry', async () => {
      // Create a very small 5x5 gray image buffer via sharp
      const sharp = require('sharp');
      const tinyBuffer = await sharp({
        create: { width: 5, height: 5, channels: 3, background: { r: 128, g: 128, b: 128 } },
      }).jpeg().toBuffer();

      const result = await service.isImageBlurry(tinyBuffer);
      expect(result).toBe(true);
    });

    it('should not crash on a valid image buffer', async () => {
      const sharp = require('sharp');
      // Create a 200x200 image with random noise-like pattern (high variance)
      const buffer = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 100, g: 150, b: 200 } },
      }).jpeg().toBuffer();

      const result = await service.isImageBlurry(buffer);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkMinDimensions', () => {
    it('should reject images below minimum size', async () => {
      const sharp = require('sharp');
      const smallBuffer = await sharp({
        create: { width: 50, height: 50, channels: 3, background: { r: 128, g: 128, b: 128 } },
      }).jpeg().toBuffer();

      const result = await service.checkMinDimensions(smallBuffer);
      expect(result).toBe(false);
    });

    it('should accept images above minimum size', async () => {
      const sharp = require('sharp');
      const largeBuffer = await sharp({
        create: { width: 400, height: 300, channels: 3, background: { r: 128, g: 128, b: 128 } },
      }).jpeg().toBuffer();

      const result = await service.checkMinDimensions(largeBuffer);
      expect(result).toBe(true);
    });
  });

  describe('validateDocument', () => {
    it('should flag expired documents', async () => {
      const sharp = require('sharp');
      const buffer = await sharp({
        create: { width: 400, height: 300, channels: 3, background: { r: 200, g: 200, b: 200 } },
      }).jpeg().toBuffer();

      const result = await service.validateDocument(
        { idNumber: '123456789012', expiry: '2020-01-01' },
        buffer,
        'aadhaar',
      );

      expect(result.isExpired).toBe(true);
      expect(result.issues).toContain('Document appears to be expired');
    });

    it('should flag missing ID number', async () => {
      const sharp = require('sharp');
      const buffer = await sharp({
        create: { width: 400, height: 300, channels: 3, background: { r: 200, g: 200, b: 200 } },
      }).jpeg().toBuffer();

      const result = await service.validateDocument(
        { idNumber: null, expiry: '2099-12-31' },
        buffer,
        'aadhaar',
      );

      expect(result.issues).toContain('Could not extract ID number from document');
    });
  });
});
