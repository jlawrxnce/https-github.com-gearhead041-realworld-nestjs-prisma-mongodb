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

export function castToCommentDto(
  comment: Comment,
  author: ProfileDto,
): CommentDto {
  return {
    id: comment.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: author,
  };
}
