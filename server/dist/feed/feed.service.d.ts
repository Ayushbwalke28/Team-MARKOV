import { PrismaService } from '../prisma/prisma.service';
interface FeedPost {
    id: string;
    createdAt: Date;
    _count: {
        likes: number;
        comments: number;
    };
    [key: string]: any;
}
export declare class FeedService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateScore(post: FeedPost): number;
    getGlobalFeed(page?: number, limit?: number): Promise<{
        data: {
            score: number;
            shareLink: string;
            _count: {
                comments: number;
                likes: number;
            };
            authorUser: {
                id: string;
                name: string;
                email: string;
            };
            authorCompany: {
                id: string;
                name: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            media: string[];
            mediaUrl: string | null;
            authorType: import(".prisma/client").$Enums.AuthorType;
            authorUserId: string | null;
            authorCompanyId: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export {};
