import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  post: { findMany: jest.fn() },
};

describe('FeedService', () => {
  let service: FeedService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<FeedService>(FeedService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScore', () => {
    it('should rank recent engaged posts higher than old quiet ones', () => {
      const recent = { id: '1', createdAt: new Date(), _count: { likes: 10, comments: 5 } };
      const old = { id: '2', createdAt: new Date(Date.now() - 200 * 3600000), _count: { likes: 0, comments: 0 } };
      expect(service.calculateScore(recent as any)).toBeGreaterThan(service.calculateScore(old as any));
    });

    it('should return 0 for very old posts with no engagement', () => {
      const old = { id: '1', createdAt: new Date(Date.now() - 500 * 3600000), _count: { likes: 0, comments: 0 } };
      expect(service.calculateScore(old as any)).toBe(0);
    });
  });

  describe('getGlobalFeed', () => {
    it('should sort by score descending', async () => {
      const now = new Date();
      prisma.post.findMany.mockResolvedValue([
        { id: 'p-1', createdAt: now, _count: { likes: 0, comments: 0 } },
        { id: 'p-2', createdAt: now, _count: { likes: 20, comments: 10 } },
      ]);
      const result = await service.getGlobalFeed(1, 20);
      expect(result.data[0].id).toBe('p-2');
    });

    it('should paginate correctly', async () => {
      const posts = Array.from({ length: 5 }, (_, i) => ({
        id: `p-${i}`, createdAt: new Date(), _count: { likes: 5 - i, comments: 0 },
      }));
      prisma.post.findMany.mockResolvedValue(posts);
      const page1 = await service.getGlobalFeed(1, 2);
      expect(page1.data.length).toBe(2);
      expect(page1.meta.totalPages).toBe(3);
    });

    it('should return empty for empty db', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      const result = await service.getGlobalFeed(1, 20);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should include shareLink', async () => {
      prisma.post.findMany.mockResolvedValue([
        { id: 'p-1', createdAt: new Date(), _count: { likes: 0, comments: 0 } },
      ]);
      const result = await service.getGlobalFeed(1, 20);
      expect(result.data[0].shareLink).toContain('/posts/p-1');
    });
  });
});
