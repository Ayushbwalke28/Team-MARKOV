import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the hello world string', () => {
      expect(service.getHello()).toBe('Hello World from NestJS!');
    });

    it('should return a string type', () => {
      expect(typeof service.getHello()).toBe('string');
    });

    it('should return a non-empty string', () => {
      expect(service.getHello().length).toBeGreaterThan(0);
    });
  });
});
