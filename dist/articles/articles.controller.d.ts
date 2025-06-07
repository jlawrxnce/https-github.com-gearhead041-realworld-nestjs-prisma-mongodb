import { User } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { MembershipService } from '../membership/membership.service';
export declare class ArticlesController {
    private articleService;
    private membershipService;
    viewArticle(user: User, slug: string): Promise<{
        article: {};
    } | {
        article: import("./dto").ArticleDto;
    }>;
    togglePaywall(user: User, slug: string): Promise<{
        article: import("./dto").ArticleDto;
    }>;
    constructor(articleService: ArticlesService, membershipService: MembershipService);
    getAllArticles(user: User, tag?: string, author?: string, favorited?: string, limit?: number, offset?: number): Promise<{
        articles: import("./dto").ArticleDto[];
        articlesCount: number;
    }>;
    getUserFeed(user: User, limit?: number, offset?: number): Promise<{
        articles: import("./dto").ArticleDto[];
        articlesCount: number;
    }>;
    getArticle(user: User, slug: string): Promise<{
        article: import("./dto").ArticleDto;
    }>;
    createArticle(user: User, dto: any): Promise<{
        article: import("./dto").ArticleDto;
    }>;
    updateArticle(user: User, slug: string, dto: any): Promise<{
        article: import("./dto").ArticleDto;
    }>;
    deleteArticle(slug: string): Promise<void>;
    addCommentToArticle(user: User, slug: string, dto: any): Promise<{
        comment: import("./dto").CommentDto;
    }>;
    getCommentsForArticle(slug: string, user: User | null): Promise<{
        comments: import("./dto").CommentDto[];
    }>;
    deleteComment(slug: string, id: string): Promise<void>;
    favoriteArticle(user: User, slug: string): Promise<{
        article: import("./dto").ArticleDto;
    }>;
    unfavoriteArticle(user: User, slug: string): Promise<{
        article: import("./dto").ArticleDto;
    }>;
}
