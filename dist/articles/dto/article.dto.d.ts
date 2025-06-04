import { Article, User } from '@prisma/client';
import { ProfileDto } from '../../profiles/dto';
export interface ArticleForCreateDto {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
}
export interface ArticleForUpdateDto {
    title?: string;
    description?: string;
    body?: string;
}
export interface ArticleDto {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList?: string[];
    favoritesCount: number;
    author: ProfileDto;
    favorited: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare function castToArticle(article: Article, user: User, tags: string[], author: ProfileDto): ArticleDto;
