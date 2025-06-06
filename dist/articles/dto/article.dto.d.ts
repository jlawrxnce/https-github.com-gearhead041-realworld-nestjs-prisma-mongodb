import { Article, User } from '@prisma/client';
import { ProfileDto } from '../../profiles/dto';
export interface ArticleForCreateDto {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
    hasPaywall?: boolean;
}
export interface ArticleForUpdateDto {
    title?: string;
    description?: string;
    body?: string;
    hasPaywall?: boolean;
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
    hasPaywall: boolean;
}
export declare function castToArticle(article: Article, user: User, tags: string[], author: ProfileDto): ArticleDto;
