import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleForCreateDto, ArticleForUpdateDto, CommentForCreateDto } from './dto';
export declare class ArticlesService {
    private prisma;
    constructor(prisma: PrismaService);
    findArticles(user: User, tag: string, author: string, favorited?: string, limit?: number, offset?: number): Promise<import("./dto").ArticleDto[]>;
    findArticle(user: User, slug: string): Promise<import("./dto").ArticleDto>;
    getUserFeed(user: User, limit: number, offset: number): Promise<import("./dto").ArticleDto[]>;
    createArticle(user: User, articletoCreate: ArticleForCreateDto): Promise<import("./dto").ArticleDto>;
    updateArticle(user: User, slug: string, dto: ArticleForUpdateDto): Promise<import("./dto").ArticleDto>;
    deleteArticle(slug: string): Promise<void>;
    addCommentToArticle(user: User, slug: string, dto: CommentForCreateDto): Promise<import("./dto").CommentDto>;
    getCommentsForArticle(slug: string): Promise<import("./dto").CommentDto[]>;
    deleteCommentForArticle(slug: string, id: string): Promise<void>;
    favouriteArticle(user: User, slug: string): Promise<import("./dto").ArticleDto>;
    unfavouriteArticle(user: User, slug: string): Promise<import("./dto").ArticleDto>;
}
