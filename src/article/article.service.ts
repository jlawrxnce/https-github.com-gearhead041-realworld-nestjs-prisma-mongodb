import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleRO } from './dto/article.dto';
import { Article } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { slug },
    });
  }

  async togglePaywall(article: Article): Promise<ArticleRO> {
    const updatedArticle = await this.prisma.article.update({
      where: { id: article.id },
      data: {
        hasPaywall: !article.hasPaywall,
      },
      include: {
        author: true,
      },
    });

    return {
      article: {
        ...updatedArticle,
        favorited: false,
        favoritesCount: 0,
        author: {
          username: updatedArticle.author.username,
          bio: updatedArticle.author.bio || '',
          image: updatedArticle.author.image || '',
          following: false,
        },
      },
    };
  }
}
