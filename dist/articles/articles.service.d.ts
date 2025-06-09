import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { ArticleDto, ArticleForCreateDto, ArticleForUpdateDto, CommentForCreateDto } from './dto';
export declare class ArticlesService {
    private prisma;
    private membershipService;
    constructor(prisma: PrismaService, membershipService: MembershipService);
    findArticles(user: User, tag: string, author: string, favorited?: string, limit?: number, offset?: number): Promise<ArticleDto[]>;
    findArticle(user: User, slug: string): Promise<ArticleDto>;
    getUserFeed(user: User, limit: number, offset: number): Promise<ArticleDto[]>;
    createArticle(user: User, articletoCreate: ArticleForCreateDto): Promise<ArticleDto>;
    updateArticle(user: User, slug: string, dto: ArticleForUpdateDto): Promise<ArticleDto>;
    deleteArticle(slug: string): Promise<void>;
    addCommentToArticle(user: User, slug: string, dto: CommentForCreateDto): Promise<import("./dto").CommentDto>;
    getCommentsForArticle(slug: string): Promise<import("./dto").CommentDto[]>;
    deleteCommentForArticle(slug: string, id: string): Promise<void>;
    favouriteArticle(user: User, slug: string): Promise<ArticleDto>;
    unfavouriteArticle(user: User, slug: string): Promise<ArticleDto>;
    togglePaywall(user: User, slug: string): Promise<ArticleDto>;
}
