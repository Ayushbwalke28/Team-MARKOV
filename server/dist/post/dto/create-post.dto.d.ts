import { AuthorType } from '@prisma/client';
export declare class CreatePostDto {
    text: string;
    media?: string[];
    authorType: AuthorType;
}
