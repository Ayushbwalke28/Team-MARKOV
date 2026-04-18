import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return status ok', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should return a timestamp string', () => {
      const result = controller.getHealth();
      expect(typeof result.timestamp).toBe('string');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should return a current-ish timestamp (within 5 seconds)', () => {
      const before = Date.now();
      const result = controller.getHealth();
      const after = Date.now();

      const ts = new Date(result.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after + 5000);
    });
  });

  describe('getHello', () => {
    it('should return the greeting from AppService', () => {
      const result = controller.getHello();
      expect(result).toBe('Hello World from NestJS!');
    });

    it('should return a string', () => {
      expect(typeof controller.getHello()).toBe('string');
    });
  });
});
