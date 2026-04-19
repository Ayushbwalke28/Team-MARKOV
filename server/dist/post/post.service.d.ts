import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class PostService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildShareLink;
    private withShareLink;
    create(userId: string, dto: CreatePostDto): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        media: string[];
        mediaUrl: string | null;
        authorType: import(".prisma/client").$Enums.AuthorType;
        authorUserId: string | null;
        authorCompanyId: string | null;
    } & {
        shareLink: string;
    }>;
    findById(id: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        media: string[];
        mediaUrl: string | null;
        authorType: import(".prisma/client").$Enums.AuthorType;
        authorUserId: string | null;
        authorCompanyId: string | null;
    } & {
        shareLink: string;
    }>;
    private verifyOwnership;
    update(id: string, userId: string, dto: UpdatePostDto): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        media: string[];
        mediaUrl: string | null;
        authorType: import(".prisma/client").$Enums.AuthorType;
        authorUserId: string | null;
        authorCompanyId: string | null;
    } & {
        shareLink: string;
    }>;
    remove(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    setMediaUrl(postId: string, userId: string, mediaUrl: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        media: string[];
        mediaUrl: string | null;
        authorType: import(".prisma/client").$Enums.AuthorType;
        authorUserId: string | null;
        authorCompanyId: string | null;
    }>;
    like(postId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        postId: string;
    }>;
    unlike(postId: string, userId: string): Promise<{
        ok: boolean;
    }>;
    addComment(postId: string, userId: string, dto: CreateCommentDto): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        text: string;
        postId: string;
    }>;
    getComments(postId: string): Promise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        text: string;
        postId: string;
    })[]>;
    removeComment(postId: string, commentId: string, userId: string): Promise<{
        ok: boolean;
    }>;
}
