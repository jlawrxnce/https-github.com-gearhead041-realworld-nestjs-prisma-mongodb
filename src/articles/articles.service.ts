import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { castToProfile, ProfileDto } from '../profiles/dto';
import {
  ArticleForCreateDto,
  ArticleForUpdateDto,
  castToArticle,
  castToCommentDto,
  CommentForCreateDto,
} from './dto';

@Injectable()
export class ArticlesService {
  private async checkPaywallAccess(articleId: string, user: User | null) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          include: { membership: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!article.hasPaywall) {
      return;
    }

    if (!user) {
      throw new ForbiddenException('This article is behind a paywall');
    }

    const userMembership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
    });

    if (!userMembership || userMembership.tier !== 'Gold') {
      throw new ForbiddenException('This article requires a Gold membership');
    }
  }

  constructor(private prisma: PrismaService) {}

  async findArticles(
    user: User | null,
    tag?: string,
    author?: string,
    favorited?: string,
    limit = 10,
    offset = 0,
  ) {
    let articles = await this.prisma.article.findMany({
      where: {
        author: {
          username: author,
        },
      },
      take: limit,
      skip: offset,
      include: {
        author: true,
        favouritedUsers: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    if (tag)
      articles = articles.filter((article) =>
        article.tagList.some((db) => db === tag),
      );

    if (favorited) {
      const favouritedUser = await this.prisma.user.findUnique({
        where: {
          username: favorited,
        },
      });
      if (favouritedUser)
        articles = articles.filter((article) =>
          article.favouritedUserIds.includes(favouritedUser.id),
        );
      else throw new NotFoundException(`user ${favorited} not found`);
    }

    if (author) {
      articles = articles.filter(
        (article) => article.author.username === author,
      );
    }

    const articlesDto = articles.map((article) => {
      const following =
        article.author?.followersIds.includes(user?.id || '') || false;
      let authorProfile: ProfileDto;
      if (!article.author) authorProfile = null;
      else authorProfile = castToProfile(article.author, following);
      return castToArticle(article, user, article.tagList, authorProfile);
    });
    return articlesDto;
  }

  async findArticle(user: User | null, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug: slug,
      },
      include: {
        author: true,
      },
    });
    if (article === null) throw new NotFoundException('article not found');

    await this.checkPaywallAccess(article.id, user);

    const following = article.author?.followersIds?.includes(user?.id) || false;

    const authorProfile = castToProfile(article.author, following);
    return castToArticle(article, user, article.tagList, authorProfile);
  }

  async getUserFeed(user: User, limit: number, offset: number) {
    let articles = await this.prisma.article.findMany({
      include: {
        author: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    articles = articles.filter((article) => {
      if (!article.author) return false;
      return article.author.followersIds.includes(user.id) || false;
    });

    const articlesDto = articles.map((article) => {
      const authorProfile = castToProfile(article.author, true);
      return castToArticle(article, user, article.tagList, authorProfile);
    });
    return articlesDto;
  }

  async createArticle(user: User, dto: ArticleForCreateDto) {
    const userMembership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
    });

    if (dto.hasPaywall && (!userMembership || userMembership.tier !== 'Gold')) {
      throw new ForbiddenException(
        'Only Gold tier members can create paywalled articles',
      );
    }

    const slug = dto.title.split(' ').join('-');
    try {
      const article = await this.prisma.article.create({
        data: {
          ...dto,
          authorId: user.id,
          slug: slug,
          favouritedUserIds: user.id,
          tagList: {
            set: dto.tagList,
          },
        },
      });
      return castToArticle(
        article,
        user,
        article.tagList,
        castToProfile(user, false),
      );
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw new ForbiddenException('article already exists');
      }
    }
  }

  async updateArticle(user: User, slug: string, dto: ArticleForUpdateDto) {
    try {
      const article = await this.prisma.article.update({
        where: {
          slug: slug,
        },
        data: {
          ...dto,
          slug: slug,
        },
        include: {
          author: true,
        },
      });
      return castToArticle(
        article,
        user,
        article.tagList,
        castToProfile(article.author, false),
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2025')
          throw new NotFoundException('article not found');
    }
  }

  async deleteArticle(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug: slug },
    });
    if (!article) throw new NotFoundException('article not found');
    await this.prisma.article.delete({
      where: {
        slug: slug,
      },
    });
    return;
  }

  async addCommentToArticle(
    user: User,
    slug: string,
    dto: CommentForCreateDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug: slug,
      },
    });
    if (!article) throw new NotFoundException('article not found');

    await this.checkPaywallAccess(article.id, user);

    const comment = await this.prisma.comment.create({
      data: {
        articleId: article.id,
        body: dto.body,
        authorId: user.id,
      },
    });
    return castToCommentDto(comment, castToProfile(user, false));
  }

  async getCommentsForArticle(slug: string, user: User | null) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
    if (article === null) throw new NotFoundException('article not found');

    await this.checkPaywallAccess(article.id, user);

    return article.comments.map((comment) => {
      return castToCommentDto(comment, castToProfile(comment.author, false));
    });
  }

  async deleteCommentForArticle(slug: string, id: string) {
    try {
      await this.prisma.article.update({
        where: {
          slug: slug,
        },

        data: {
          comments: {
            delete: {
              id: id,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        if (error.code === 'P2002')
          throw new NotFoundException('article not found');
    }
  }

  async favouriteArticle(user: User, slug: string) {
    let article = await this.prisma.article.findUnique({
      where: { slug: slug },
      include: {
        author: true,
      },
    });
    if (!article) throw new NotFoundException('article not found');

    await this.checkPaywallAccess(article.id, user);

    if (!article.favouritedUserIds.includes(user.id)) {
      article = await this.prisma.article.update({
        where: {
          slug: slug,
        },
        data: {
          favouritedUserIds: {
            push: user.id,
          },
        },
        include: {
          author: true,
        },
      });
    }
    const following = article.author?.followersIds.includes(user.id) || false;
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(user, following),
    );
  }

  async unfavouriteArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug: slug },
    });
    if (!article) throw new NotFoundException('article not found');

    await this.checkPaywallAccess(article.id, user);

    article.favouritedUserIds = article.favouritedUserIds.filter(
      (id) => id !== user.id,
    );
    delete article.id;
    const articleUpdated = await this.prisma.article.update({
      where: { slug: slug },
      data: article,
      include: { author: true },
    });
    const isfollowing =
      articleUpdated.author?.followersIds.includes(user.id) || false;
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(articleUpdated.author, isfollowing),
    );
  }
}
