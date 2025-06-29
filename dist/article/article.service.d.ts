import { PrismaService } from '../prisma/prisma.service';
import { ArticleRO } from './dto/article.dto';
import { Article } from '@prisma/client';
export declare class ArticleService {
    private prisma;
    constructor(prisma: PrismaService);
    findBySlug(slug: string): Promise<Article | null>;
    togglePaywall(article: Article): Promise<ArticleRO>;
}
