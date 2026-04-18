import { FaceService } from './face.service';

describe('FaceService', () => {
  let service: FaceService;

  beforeEach(() => {
    service = new FaceService();
  });

  describe('detectFace', () => {
    it('should return detected=false for a tiny image', async () => {
      const sharp = require('sharp');
      const tinyBuffer = await sharp({
        create: { width: 10, height: 10, channels: 3, background: { r: 0, g: 0, b: 0 } },
      }).jpeg().toBuffer();

      const result = await service.detectFace(tinyBuffer);
      expect(result.detected).toBe(false);
    });

    it('should process a valid image without crashing', async () => {
      const sharp = require('sharp');
      // Create an image with skin-tone-like colors
      const buffer = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 200, g: 150, b: 120 } },
      }).jpeg().toBuffer();

      const result = await service.detectFace(buffer);
      expect(typeof result.detected).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.faceCount).toBe('number');
    });
  });

  describe('compareFaces', () => {
    it('should return high similarity for identical images', async () => {
      const sharp = require('sharp');
      const buffer = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 180, g: 140, b: 100 } },
      }).jpeg().toBuffer();

      const result = await service.compareFaces(buffer, buffer);
      // Identical images should have very high similarity
      expect(result.similarity).toBeGreaterThanOrEqual(0.9);
      expect(result.match).toBe(true);
    });

    it('should return lower similarity for very different images', async () => {
      const sharp = require('sharp');
      const img1 = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 255, g: 0, b: 0 } },
      }).jpeg().toBuffer();
      const img2 = await sharp({
        create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 0, b: 255 } },
      }).jpeg().toBuffer();

      const result = await service.compareFaces(img1, img2);
      expect(typeof result.similarity).toBe('number');
      expect(result.similarity).toBeLessThan(1);
    });
  });

  describe('analyzeLiveness', () => {
    it('should reject a tiny image as not live', async () => {
      const sharp = require('sharp');
      const tinyBuffer = await sharp({
        create: { width: 50, height: 50, channels: 3, background: { r: 128, g: 128, b: 128 } },
      }).jpeg().toBuffer();

      const result = await service.analyzeLiveness(tinyBuffer);
      expect(result).toBe(false);
    });

    it('should process a valid image without crashing', async () => {
      const sharp = require('sharp');
      const buffer = await sharp({
        create: { width: 300, height: 300, channels: 3, background: { r: 200, g: 150, b: 120 } },
      }).jpeg().toBuffer();

      const result = await service.analyzeLiveness(buffer);
      expect(typeof result).toBe('boolean');
    });
  });
});
