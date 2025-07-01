import {
  BadRequestException,
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
import { MembershipService } from '../membership/membership.service';
import { MembershipTier } from '../membership/dto';
import { castToProfile, ProfileDto } from '../profiles/dto';
import {
  ArticleDto,
  ArticleForCreateDto,
  ArticleForUpdateDto,
  castToArticle,
  castToCommentDto,
  CommentForCreateDto,
} from './dto';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private membershipService: MembershipService,
  ) {}

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

  async togglePaywall(user: User, slug: string): Promise<ArticleDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!article) throw new NotFoundException('article not found');

    if (article.authorId !== user.id) {
      throw new ForbiddenException('cannot modify others articles');
    }

    // Check if user has appropriate membership tier
    const membership = await this.membershipService.getMembership(user);
    if (!membership || membership.tier === MembershipTier.Free) {
      throw new ForbiddenException(
        'Only Trial or Gold members can create paywalls',
      );
    }

    // For Trial users, check if they're trying to enable a paywall and already have 3 active paywalls
    if (
      membership.tier === MembershipTier.Trial &&
      !article.hasPaywall &&
      membership.activePaywalls >= 3
    ) {
      throw new ForbiddenException(
        'Trial members can only have up to 3 active paywalls',
      );
    }

    // Update active paywalls count if needed
    if (!article.hasPaywall) {
      // Adding a new paywall
      await this.membershipService.incrementActivePaywalls(user.id);
    } else {
      // Removing a paywall
      await this.membershipService.decrementActivePaywalls(user.id);
    }

    // Toggle paywall status
    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: {
        hasPaywall: !article.hasPaywall,
      },
      include: {
        author: {
          include: {
            followers: true,
          },
        },
      },
    });

    // Get following status
    const following = user
      ? updatedArticle.author.followers.some(
          (follower) => follower.id === user.id,
        )
      : false;

    // Return formatted article
    return castToArticle(
      updatedArticle,
      user,
      updatedArticle.tagList,
      castToProfile(updatedArticle.author, following),
    );
  }

  async viewArticle(user: User, slug: string): Promise<ArticleDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
            membership: true
          }
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Don't count author's own views
    if (article.authorId === user.id) {
      const author = await this.prisma.user.findUnique({
        where: { id: article.authorId },
      });
      const following = author?.followersIds?.includes(user.id) || false;
      return castToArticle(
        article,
        user,
        article.tagList,
        castToProfile(author, following),
      );
    }

    // Get author's membership tier to calculate revenue
    const author = await this.prisma.user.findUnique({
      where: { id: article.authorId },
      include: {
        membership: true,
      },
    });

    if (author?.membership) {
      // Calculate revenue based on membership tier
      const revenue =
        author.membership.tier === MembershipTier.Gold.toString()
          ? 0.25
          : author.membership.tier === MembershipTier.Trial.toString()
          ? 0.10
          : 0;

      if (revenue > 0) {
        await this.membershipService.addRevenue(article.authorId, revenue);
      }
      
      // Increment total views for the author regardless of tier
      await this.membershipService.incrementTotalViews(article.authorId);
    }

    // Update view count for the article
    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: {
        viewCount: { increment: 1 },
      },
      include: {
        author: true,
      },
    });

    const following = author?.followersIds?.includes(user.id) || false;
    const authorProfile = castToProfile(author, following);

    return castToArticle(
      updatedArticle,
      user,
      updatedArticle.tagList,
      authorProfile,
    );
  }
}