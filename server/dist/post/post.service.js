"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const POST_INCLUDE = {
    authorUser: { select: { id: true, name: true, email: true } },
    authorCompany: { select: { id: true, name: true } },
    _count: { select: { likes: true, comments: true } },
};
let PostService = class PostService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildShareLink(postId) {
        const baseUrl = process.env.APP_URL || 'http://localhost:3001/api';
        return `${baseUrl}/posts/${postId}`;
    }
    withShareLink(post) {
        return { ...post, shareLink: this.buildShareLink(post.id) };
    }
    async create(userId, dto) {
        let authorCompanyId = undefined;
        let authorUserId = undefined;
        if (dto.authorType === client_1.AuthorType.company) {
            const company = await this.prisma.company.findUnique({
                where: { ownerId: userId },
            });
            if (!company) {
                throw new common_1.ForbiddenException('You must own a company to create a post as a company.');
            }
            authorCompanyId = company.id;
        }
        else {
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
    async findById(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: POST_INCLUDE,
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return this.withShareLink(post);
    }
    async verifyOwnership(id, userId) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { authorCompany: true },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.authorType === client_1.AuthorType.user) {
            if (post.authorUserId !== userId) {
                throw new common_1.ForbiddenException('Not your post');
            }
        }
        else if (post.authorType === client_1.AuthorType.company) {
            if (post.authorCompany?.ownerId !== userId) {
                throw new common_1.ForbiddenException('Not your post');
            }
        }
        return post;
    }
    async update(id, userId, dto) {
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
    async remove(id, userId) {
        await this.verifyOwnership(id, userId);
        await this.prisma.post.delete({ where: { id } });
        return { ok: true };
    }
    async setMediaUrl(postId, userId, mediaUrl) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        await this.verifyOwnership(postId, userId);
        return this.prisma.post.update({
            where: { id: postId },
            data: { mediaUrl },
            include: POST_INCLUDE,
        });
    }
    async like(postId, userId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const existing = await this.prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already liked this post');
        }
        return this.prisma.postLike.create({
            data: { postId, userId },
        });
    }
    async unlike(postId, userId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const existing = await this.prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (!existing) {
            throw new common_1.NotFoundException('You have not liked this post');
        }
        await this.prisma.postLike.delete({
            where: { postId_userId: { postId, userId } },
        });
        return { ok: true };
    }
    async addComment(postId, userId, dto) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
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
    async getComments(postId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return this.prisma.postComment.findMany({
            where: { postId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async removeComment(postId, commentId, userId) {
        const comment = await this.prisma.postComment.findUnique({
            where: { id: commentId },
        });
        if (!comment || comment.postId !== postId) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('Not your comment');
        }
        await this.prisma.postComment.delete({ where: { id: commentId } });
        return { ok: true };
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostService);
//# sourceMappingURL=post.service.js.map