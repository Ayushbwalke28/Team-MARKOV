import { OcrService } from './ocr.service';

describe('OcrService', () => {
  let service: OcrService;

  beforeEach(() => {
    service = new OcrService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('parseDocument', () => {
    it('should extract Aadhaar number from text', () => {
      const text = 'Government of India\nJohn Doe\nDOB: 15/06/1990\n1234 5678 9012\nAddress: 123 Street';
      const result = service.parseDocument(text, 'aadhaar');
      expect(result.idNumber).toBe('123456789012');
    });

    it('should extract PAN card number from text', () => {
      const text = 'INCOME TAX DEPARTMENT\nName: Jane Smith\nABCDE1234F\nDate of Birth: 20/03/1985';
      const result = service.parseDocument(text, 'pan_card');
      expect(result.idNumber).toBe('ABCDE1234F');
    });

    it('should extract passport number from text', () => {
      const text = 'PASSPORT\nSurname: DOE\nGiven Name: JOHN\nA1234567\nDate of Birth: 1990-06-15';
      const result = service.parseDocument(text, 'passport');
      expect(result.idNumber).toBe('A1234567');
    });

    it('should extract dates from DD/MM/YYYY format', () => {
      const text = 'DOB: 15/06/1990\nExpiry: 20/12/2030';
      const result = service.parseDocument(text, 'passport');
      expect(result.dob).toBe('1990-06-15');
      expect(result.expiry).toBe('2030-12-20');
    });

    it('should extract dates from YYYY-MM-DD format', () => {
      const text = 'DOB: 1990-06-15\nExpiry: 2030-12-20';
      const result = service.parseDocument(text, 'passport');
      expect(result.dob).toBe('1990-06-15');
      expect(result.expiry).toBe('2030-12-20');
    });

    it('should extract name using label pattern', () => {
      const text = 'Name: John Michael Doe\nDOB: 15/06/1990';
      const result = service.parseDocument(text, 'national_id');
      expect(result.name).toBe('John Michael Doe');
    });

    it('should return rawText in parsed result', () => {
      const text = 'Some OCR text';
      const result = service.parseDocument(text, 'passport');
      expect(result.rawText).toBe(text);
    });

    it('should return nulls when no data is found', () => {
      const text = 'random gibberish text with no useful data';
      const result = service.parseDocument(text, 'passport');
      expect(result.idNumber).toBeNull();
    });
  });

  describe('validateIdFormat', () => {
    it('should validate correct Aadhaar number', () => {
      expect(service.validateIdFormat('123456789012', 'aadhaar')).toBe(true);
    });

    it('should reject invalid Aadhaar number', () => {
      expect(service.validateIdFormat('12345', 'aadhaar')).toBe(false);
    });

    it('should validate correct PAN number', () => {
      expect(service.validateIdFormat('ABCDE1234F', 'pan_card')).toBe(true);
    });

    it('should reject invalid PAN number', () => {
      expect(service.validateIdFormat('12345', 'pan_card')).toBe(false);
    });

    it('should validate correct passport number', () => {
      expect(service.validateIdFormat('A1234567', 'passport')).toBe(true);
    });

    it('should return true for unknown document type', () => {
      expect(service.validateIdFormat('anything', 'unknown_type')).toBe(true);
    });
  });
});
