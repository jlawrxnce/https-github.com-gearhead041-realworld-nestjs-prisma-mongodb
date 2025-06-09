import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipTier, User } from '@prisma/client';
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
  constructor(private prisma: PrismaService) {}

  async viewArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            membershipTier: true,
            totalRevenue: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (
      article.author.membershipTier === MembershipTier.Free ||
      user.membershipTier === MembershipTier.Free
    ) {
      return article;
    }

    // Don't count author's own views
    // if (article.authorId === user.id) {
    //   return article;
    // }

    // // Check if user has already viewed
    // if (article.viewerIds.includes(user.id)) {
    //   return article;
    // }

    // Update article views and add viewer
    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: {
        numViews: { increment: 1 },
        viewerIds: { push: user.id },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            membershipTier: true,
            totalRevenue: true,
          },
        },
      },
    });

    // Calculate revenue based on author's membership tier
    const revenuePerView =
      updatedArticle.author.membershipTier === MembershipTier.Gold ? 0.25 : 0.1;
    console.log('updated aritcle', updatedArticle);
    // Update author's revenue
    await this.prisma.user.update({
      where: { id: article.authorId },
      data: {
        totalRevenue: { increment: revenuePerView },
      },
    });

    return updatedArticle;
  }
  async togglePaywall(user: User, slug: string) {
    const userWithMembership = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { membershipTier: true },
    });

    if (userWithMembership?.membershipTier === MembershipTier.Free) {
      throw new ForbiddenException('Only Gold members can toggle paywalls');
    }

    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== user.id) {
      throw new ForbiddenException(
        'Only the article author can toggle its paywall',
      );
    }

    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: { hasPaywall: !article.hasPaywall },
      include: { author: true },
    });

    const following =
      updatedArticle.author?.followersIds?.includes(user?.id) || false;
    const authorProfile = castToProfile(updatedArticle.author, following);
    return castToArticle(
      updatedArticle,
      user,
      updatedArticle.tagList,
      authorProfile,
    );
  }

  async findArticles(
    user: User,
    tag: string,
    author: string,
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

  async findArticle(user: User, slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug: slug,
      },
      include: {
        author: true,
      },
    });
    if (article === null) throw new NotFoundException('article not found');

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

  async createArticle(user: User, articletoCreate: ArticleForCreateDto) {
    const slug = articletoCreate.title.split(' ').join('-');
    try {
      const article = await this.prisma.article.create({
        data: {
          ...articletoCreate,
          authorId: user.id,
          slug: slug,
          favouritedUserIds: user.id,
          tagList: {
            set: articletoCreate.tagList,
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
        throw new BadRequestException('bad request');
      }
      // if (error.code === 'P2002')
    }
  }

  async updateArticle(user: User, slug: string, dto: ArticleForUpdateDto) {
    // const newSlug = slug + '.01';
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
    const comment = await this.prisma.comment.create({
      data: {
        articleId: article.id,
        body: dto.body,
        authorId: user.id,
      },
    });
    return castToCommentDto(comment, castToProfile(user, false));
  }

  async getCommentsForArticle(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        slug: slug,
      },
      select: {
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
    if (article === null) throw new NotFoundException('article not found');
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
