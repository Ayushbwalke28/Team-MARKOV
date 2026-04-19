import { PostService } from './post.service';
import { MediaService } from '../media/media.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class PostController {
    private readonly postService;
    private readonly mediaService;
    constructor(postService: PostService, mediaService: MediaService);
    create(req: any, dto: CreatePostDto): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, req: any, dto: UpdatePostDto): Promise<{
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
    remove(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    like(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        postId: string;
    }>;
    unlike(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    addComment(id: string, req: any, dto: CreateCommentDto): Promise<{
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
    getComments(id: string): Promise<({
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
    removeComment(id: string, commentId: string, req: any): Promise<{
        ok: boolean;
    }>;
    uploadMedia(id: string, req: any, file: Express.Multer.File): Promise<{
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
}
