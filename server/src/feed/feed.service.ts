import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FeedPost {
  id: string;
  createdAt: Date;
  _count: { likes: number; comments: number };
  [key: string]: any;
}

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate a ranking score for a post based on engagement and recency.
   *
   * Formula:  score = likesCount * 2 + commentsCount * 3 + recencyBonus
   * recencyBonus = max(0, 100 - hoursElapsed)
   *
   * This ensures:
   *  - Latest posts have higher priority (recency bonus decays over ~4 days)
   *  - Posts with more likes/comments are more preferred
   */
  calculateScore(post: FeedPost): number {
    const now = Date.now();
    const hoursElapsed =
      (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 100 - hoursElapsed);
    const likesScore = (post._count?.likes ?? 0) * 2;
    const commentsScore = (post._count?.comments ?? 0) * 3;
    return likesScore + commentsScore + recencyBonus;
  }

  /**
   * Fetch the global feed — a ranked set of posts for the homepage.
   *
   * Posts are fetched in bulk (latest first, capped at 200), scored by the
   * ranking algorithm, and then paginated in-memory. For a production system
   * at scale this would use a materialised score column or Redis sorted set,
   * but in-memory ranking is perfectly adequate for moderate traffic.
   */
  async getGlobalFeed(page: number = 1, limit: number = 20) {
    const MAX_CANDIDATE_POSTS = 200;

    const posts = await this.prisma.post.findMany({
      take: MAX_CANDIDATE_POSTS,
      orderBy: { createdAt: 'desc' },
      include: {
        authorUser: { select: { id: true, name: true, email: true } },
        authorCompany: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Score and sort
    const scored = posts
      .map((post) => ({
        ...post,
        score: this.calculateScore(post),
        shareLink: `${process.env.APP_URL || 'http://localhost:3001/api'}/posts/${post.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    // Paginate
    const start = (page - 1) * limit;
    const paginatedPosts = scored.slice(start, start + limit);

    return {
      data: paginatedPosts,
      meta: {
        page,
        limit,
        total: scored.length,
        totalPages: Math.ceil(scored.length / limit),
      },
    };
  }
}
