import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    getGlobalFeed(page?: string, limit?: string): Promise<{
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
