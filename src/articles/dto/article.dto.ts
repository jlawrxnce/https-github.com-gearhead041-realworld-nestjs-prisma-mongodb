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

export function castToArticle(
  article: Article,
  user: User,
  tags: string[],
  author: ProfileDto,
): ArticleDto {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: tags,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited: article.favouritedUserIds.includes(user?.id) || false,
    favoritesCount: article.favouritedUserIds.length,
    hasPaywall: article.hasPaywall,
    author: author,
  };
}
