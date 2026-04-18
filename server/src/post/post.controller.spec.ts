jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  AuthorType: { user: 'user', company: 'company' },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';

const mockPostService = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  like: jest.fn(),
  unlike: jest.fn(),
  addComment: jest.fn(),
  getComments: jest.fn(),
  removeComment: jest.fn(),
};

describe('PostController', () => {
  let controller: PostController;
  let service: typeof mockPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: mockPostService }],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to postService.create', async () => {
      const dto = { text: 'Hello', authorType: 'user' };
      const req = { user: { userId: 'u-1' } };
      service.create.mockResolvedValue({ id: 'p-1', ...dto });

      await controller.create(req, dto as any);
      expect(service.create).toHaveBeenCalledWith('u-1', dto);
    });
  });

  describe('findOne', () => {
    it('should delegate to postService.findById', async () => {
      service.findById.mockResolvedValue({ id: 'p-1', text: 'Hello' });
      const result = await controller.findOne('p-1');
      expect(service.findById).toHaveBeenCalledWith('p-1');
      expect(result.id).toBe('p-1');
    });
  });

  describe('update', () => {
    it('should delegate to postService.update', async () => {
      const dto = { text: 'Updated' };
      const req = { user: { userId: 'u-1' } };
      service.update.mockResolvedValue({ id: 'p-1', ...dto });

      await controller.update('p-1', req, dto as any);
      expect(service.update).toHaveBeenCalledWith('p-1', 'u-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to postService.remove', async () => {
      const req = { user: { userId: 'u-1' } };
      service.remove.mockResolvedValue({ ok: true });

      const result = await controller.remove('p-1', req);
      expect(service.remove).toHaveBeenCalledWith('p-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('like', () => {
    it('should delegate to postService.like', async () => {
      const req = { user: { userId: 'u-1' } };
      service.like.mockResolvedValue({ id: 'l-1', postId: 'p-1', userId: 'u-1' });

      const result = await controller.like('p-1', req);
      expect(service.like).toHaveBeenCalledWith('p-1', 'u-1');
      expect(result.id).toBe('l-1');
    });
  });

  describe('unlike', () => {
    it('should delegate to postService.unlike', async () => {
      const req = { user: { userId: 'u-1' } };
      service.unlike.mockResolvedValue({ ok: true });

      const result = await controller.unlike('p-1', req);
      expect(service.unlike).toHaveBeenCalledWith('p-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('addComment', () => {
    it('should delegate to postService.addComment', async () => {
      const dto = { text: 'Nice!' };
      const req = { user: { userId: 'u-1' } };
      service.addComment.mockResolvedValue({ id: 'cm-1', ...dto });

      await controller.addComment('p-1', req, dto as any);
      expect(service.addComment).toHaveBeenCalledWith('p-1', 'u-1', dto);
    });
  });

  describe('getComments', () => {
    it('should delegate to postService.getComments', async () => {
      service.getComments.mockResolvedValue([{ id: 'cm-1' }]);

      const result = await controller.getComments('p-1');
      expect(service.getComments).toHaveBeenCalledWith('p-1');
      expect(result.length).toBe(1);
    });
  });

  describe('removeComment', () => {
    it('should delegate to postService.removeComment', async () => {
      const req = { user: { userId: 'u-1' } };
      service.removeComment.mockResolvedValue({ ok: true });

      const result = await controller.removeComment('p-1', 'cm-1', req);
      expect(service.removeComment).toHaveBeenCalledWith('p-1', 'cm-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });
  });
});
