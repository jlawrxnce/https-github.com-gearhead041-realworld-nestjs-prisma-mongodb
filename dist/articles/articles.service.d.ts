import { MembershipTier, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleForCreateDto, ArticleForUpdateDto, CommentForCreateDto } from './dto';
export declare class ArticlesService {
    private prisma;
    constructor(prisma: PrismaService);
    viewArticle(user: User, slug: string): Promise<{
        author: {
            id: string;
            username: string;
            bio: string;
            image: string;
            membershipTier: MembershipTier;
            totalRevenue: number;
        };
    } & import("@prisma/client/runtime").GetResult<{
        id: string;
        title: string;
        slug: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        body: string;
        hasPaywall: boolean;
        numViews: number;
        viewerIds: string[];
        tagList: string[];
        favouritedUserIds: string[];
        authorId: string;
    }, unknown, never> & {}>;
    togglePaywall(user: User, slug: string): Promise<import("./dto").ArticleDto>;
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
