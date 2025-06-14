import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleForCreateDto, ArticleForUpdateDto, CommentForCreateDto } from './dto';
export declare class ArticlesService {
    private prisma;
    incrementViews(slug: string, user: User | null, revenueEarned?: number): Promise<import("./dto").ArticleDto>;
    private checkPaywallAccess;
    constructor(prisma: PrismaService);
    findArticles(user: User | null, tag?: string, author?: string, favorited?: string, limit?: number, offset?: number): Promise<import("./dto").ArticleDto[]>;
    findArticle(user: User | null, slug: string): Promise<import("./dto").ArticleDto>;
    getUserFeed(user: User, limit: number, offset: number): Promise<import("./dto").ArticleDto[]>;
    createArticle(user: User, dto: ArticleForCreateDto): Promise<import("./dto").ArticleDto>;
    updateArticle(user: User, slug: string, dto: ArticleForUpdateDto): Promise<import("./dto").ArticleDto>;
    deleteArticle(slug: string): Promise<void>;
    addCommentToArticle(user: User, slug: string, dto: CommentForCreateDto): Promise<import("./dto").CommentDto>;
    getCommentsForArticle(slug: string, user: User | null): Promise<import("./dto").CommentDto[]>;
    deleteCommentForArticle(slug: string, id: string): Promise<void>;
    favouriteArticle(user: User, slug: string): Promise<import("./dto").ArticleDto>;
    unfavouriteArticle(user: User, slug: string): Promise<import("./dto").ArticleDto>;
}
