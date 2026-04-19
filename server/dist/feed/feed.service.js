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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedService = class FeedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateScore(post) {
        const now = Date.now();
        const hoursElapsed = (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyBonus = Math.max(0, 100 - hoursElapsed);
        const likesScore = (post._count?.likes ?? 0) * 2;
        const commentsScore = (post._count?.comments ?? 0) * 3;
        return likesScore + commentsScore + recencyBonus;
    }
    async getGlobalFeed(page = 1, limit = 20) {
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
        const scored = posts
            .map((post) => ({
            ...post,
            score: this.calculateScore(post),
            shareLink: `${process.env.APP_URL || 'http://localhost:3001/api'}/posts/${post.id}`,
        }))
            .sort((a, b) => b.score - a.score);
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
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedService);
//# sourceMappingURL=feed.service.js.map