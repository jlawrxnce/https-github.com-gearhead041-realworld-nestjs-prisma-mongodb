import { ProfileDto } from '../../profiles/dto';
import { Comment } from '@prisma/client';
export interface CommentForCreateDto {
    body: string;
}
export interface CommentDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    body: string;
    author: ProfileDto;
}
export declare function castToCommentDto(comment: Comment, author: ProfileDto): CommentDto;
