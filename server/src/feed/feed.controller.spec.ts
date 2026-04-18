import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

const mockFeedService = {
  getGlobalFeed: jest.fn(),
};

describe('FeedController', () => {
  let controller: FeedController;
  let service: typeof mockFeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [{ provide: FeedService, useValue: mockFeedService }],
    }).compile();
    controller = module.get<FeedController>(FeedController);
    service = module.get(FeedService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGlobalFeed', () => {
    it('should delegate with default page/limit', async () => {
      service.getGlobalFeed.mockResolvedValue({ data: [], meta: {} });
      await controller.getGlobalFeed(undefined, undefined);
      expect(service.getGlobalFeed).toHaveBeenCalledWith(1, 20);
    });

    it('should parse query params', async () => {
      service.getGlobalFeed.mockResolvedValue({ data: [], meta: {} });
      await controller.getGlobalFeed('2', '10');
      expect(service.getGlobalFeed).toHaveBeenCalledWith(2, 10);
    });

    it('should clamp limit to max 50', async () => {
      service.getGlobalFeed.mockResolvedValue({ data: [], meta: {} });
      await controller.getGlobalFeed('1', '100');
      expect(service.getGlobalFeed).toHaveBeenCalledWith(1, 50);
    });

    it('should clamp page to min 1', async () => {
      service.getGlobalFeed.mockResolvedValue({ data: [], meta: {} });
      await controller.getGlobalFeed('-5', '10');
      expect(service.getGlobalFeed).toHaveBeenCalledWith(1, 10);
    });
  });
});
