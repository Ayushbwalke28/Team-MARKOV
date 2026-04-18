import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { describe } from 'node:test';

jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  AuthorType: { user: 'user', company: 'company' },
}));

const mockPrismaService = {
  post: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
  postLike: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  postComment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PostService', () => {
  let service: PostService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── CREATE ────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a user post', async () => {
      const dto = { text: 'Hello world', authorType: 'user' as const };
      const created = { id: 'p-1', ...dto, media: [], authorUserId: 'u-1' };
      prisma.post.create.mockResolvedValue(created);

      const result = await service.create('u-1', dto as any);

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ authorUserId: 'u-1' }),
        }),
      );
      expect(result.id).toBe('p-1');
      expect(result.shareLink).toContain('/posts/p-1');
    });

    it('should create a company post when user owns a company', async () => {
      const dto = { text: 'Company update', authorType: 'company' as const };
      prisma.company.findUnique.mockResolvedValue({ id: 'c-1', ownerId: 'u-1' });
      prisma.post.create.mockResolvedValue({
        id: 'p-2',
        ...dto,
        media: [],
        authorCompanyId: 'c-1',
      });

      const result = await service.create('u-1', dto as any);

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ authorCompanyId: 'c-1' }),
        }),
      );
      expect(result.id).toBe('p-2');
    });

    it('should throw ForbiddenException if user has no company for company post', async () => {
      const dto = { text: 'Oops', authorType: 'company' as const };
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.create('u-1', dto as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── FIND BY ID ────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return a post with shareLink', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1', text: 'Hello' });
      const result = await service.findById('p-1');
      expect(result.text).toBe('Hello');
      expect(result.shareLink).toContain('/posts/p-1');
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.findById('nope')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UPDATE ────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update a user post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        id: 'p-1',
        authorType: 'user',
        authorUserId: 'u-1',
      });
      prisma.post.update.mockResolvedValue({ id: 'p-1', text: 'Updated' });

      const result = await service.update('p-1', 'u-1', { text: 'Updated' });
      expect(result.text).toBe('Updated');
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        id: 'p-1',
        authorType: 'user',
        authorUserId: 'other-user',
      });

      await expect(
        service.update('p-1', 'u-1', { text: 'Nope' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nope', 'u-1', { text: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── REMOVE ────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a post owned by the user', async () => {
      prisma.post.findUnique.mockResolvedValue({
        id: 'p-1',
        authorType: 'user',
        authorUserId: 'u-1',
      });
      prisma.post.delete.mockResolvedValue({});

      const result = await service.remove('p-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });

    it('should throw ForbiddenException if not the author', async () => {
      prisma.post.findUnique.mockResolvedValue({
        id: 'p-1',
        authorType: 'user',
        authorUserId: 'other',
      });

      await expect(service.remove('p-1', 'u-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── LIKE ──────────────────────────────────────────────────────────────

  describe('like', () => {
    it('should like a post successfully', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postLike.findUnique.mockResolvedValue(null);
      prisma.postLike.create.mockResolvedValue({
        id: 'l-1',
        postId: 'p-1',
        userId: 'u-1',
      });

      const result = await service.like('p-1', 'u-1');
      expect(result.id).toBe('l-1');
    });

    it('should throw ConflictException if already liked', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postLike.findUnique.mockResolvedValue({ id: 'l-1' });

      await expect(service.like('p-1', 'u-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.like('nope', 'u-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── UNLIKE ────────────────────────────────────────────────────────────

  describe('unlike', () => {
    it('should unlike a post successfully', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postLike.findUnique.mockResolvedValue({ id: 'l-1' });
      prisma.postLike.delete.mockResolvedValue({});

      const result = await service.unlike('p-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });

    it('should throw NotFoundException if not liked', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postLike.findUnique.mockResolvedValue(null);

      await expect(service.unlike('p-1', 'u-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── ADD COMMENT ───────────────────────────────────────────────────────

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postComment.create.mockResolvedValue({
        id: 'cm-1',
        postId: 'p-1',
        userId: 'u-1',
        text: 'Nice!',
      });

      const result = await service.addComment('p-1', 'u-1', { text: 'Nice!' });
      expect(result.id).toBe('cm-1');
    });

    it('should throw NotFoundException if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.addComment('nope', 'u-1', { text: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GET COMMENTS ──────────────────────────────────────────────────────

  describe('getComments', () => {
    it('should return comments ordered by creation date', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'p-1' });
      prisma.postComment.findMany.mockResolvedValue([
        { id: 'cm-1', text: 'First' },
        { id: 'cm-2', text: 'Second' },
      ]);

      const result = await service.getComments('p-1');
      expect(result.length).toBe(2);
      expect(prisma.postComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        }),
      );
    });

    it('should throw NotFoundException if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.getComments('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── REMOVE COMMENT ───────────────────────────────────────────────────

  describe('removeComment', () => {
    it('should delete a comment owned by the user', async () => {
      prisma.postComment.findUnique.mockResolvedValue({
        id: 'cm-1',
        postId: 'p-1',
        userId: 'u-1',
      });
      prisma.postComment.delete.mockResolvedValue({});

      const result = await service.removeComment('p-1', 'cm-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });

    it('should throw ForbiddenException if not the comment author', async () => {
      prisma.postComment.findUnique.mockResolvedValue({
        id: 'cm-1',
        postId: 'p-1',
        userId: 'other-user',
      });

      await expect(
        service.removeComment('p-1', 'cm-1', 'u-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      prisma.postComment.findUnique.mockResolvedValue(null);

      await expect(
        service.removeComment('p-1', 'nope', 'u-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if comment belongs to a different post', async () => {
      prisma.postComment.findUnique.mockResolvedValue({
        id: 'cm-1',
        postId: 'p-other',
        userId: 'u-1',
      });

      await expect(
        service.removeComment('p-1', 'cm-1', 'u-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
