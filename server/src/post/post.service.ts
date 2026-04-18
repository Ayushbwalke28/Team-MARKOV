import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthorType } from '@prisma/client';

/** Default include shape for post queries — author info + aggregated counts */
const POST_INCLUDE = {
  authorUser: { select: { id: true, name: true, email: true } },
  authorCompany: { select: { id: true, name: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  /** Build the universal share link for a given post id */
  private buildShareLink(postId: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001/api';
    return `${baseUrl}/posts/${postId}`;
  }

  /** Attach the computed shareLink field to a post object */
  private withShareLink<T extends { id: string }>(post: T): T & { shareLink: string } {
    return { ...post, shareLink: this.buildShareLink(post.id) };
  }

  async create(userId: string, dto: CreatePostDto) {
    let authorCompanyId: string | undefined = undefined;
    let authorUserId: string | undefined = undefined;

    if (dto.authorType === AuthorType.company) {
      const company = await this.prisma.company.findUnique({
        where: { ownerId: userId },
      });
      if (!company) {
        throw new ForbiddenException(
          'You must own a company to create a post as a company.',
        );
      }
      authorCompanyId = company.id;
    } else {
      authorUserId = userId;
    }

    const post = await this.prisma.post.create({
      data: {
        text: dto.text,
        media: dto.media || [],
        authorType: dto.authorType,
        authorUserId,
        authorCompanyId,
      },
      include: POST_INCLUDE,
    });

    return this.withShareLink(post);
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    if (!post) throw new NotFoundException('Post not found');
    return this.withShareLink(post);
  }

  /**
   * Verify the requesting user is the author of the post.
   * For company posts, the user must be the owner of the authoring company.
   */
  private async verifyOwnership(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { authorCompany: true },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (post.authorType === AuthorType.user) {
      if (post.authorUserId !== userId) {
        throw new ForbiddenException('Not your post');
      }
    } else if (post.authorType === AuthorType.company) {
      if (post.authorCompany?.ownerId !== userId) {
        throw new ForbiddenException('Not your post');
      }
    }

    return post;
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    await this.verifyOwnership(id, userId);

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        text: dto.text,
        media: dto.media,
      },
      include: POST_INCLUDE,
    });

    return this.withShareLink(post);
  }

  async remove(id: string, userId: string) {
    await this.verifyOwnership(id, userId);
    await this.prisma.post.delete({ where: { id } });
    return { ok: true };
  }

  async like(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      throw new ConflictException('You have already liked this post');
    }

    return this.prisma.postLike.create({
      data: { postId, userId },
    });
  }

  async unlike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (!existing) {
      throw new NotFoundException('You have not liked this post');
    }

    await this.prisma.postLike.delete({
      where: { postId_userId: { postId, userId } },
    });
    return { ok: true };
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.postComment.create({
      data: {
        postId,
        userId,
        text: dto.text,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async getComments(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.postComment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeComment(postId: string, commentId: string, userId: string) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.postId !== postId) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('Not your comment');
    }

    await this.prisma.postComment.delete({ where: { id: commentId } });
    return { ok: true };
  }
}
