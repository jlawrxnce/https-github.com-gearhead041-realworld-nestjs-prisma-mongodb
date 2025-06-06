import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AllowAny, GetUser } from '../common/decorator';
import { JwtGuard } from '../common/guard';
import { ArticlesService } from './articles.service';
import { MembershipService } from '../membership/membership.service';
import { ForbiddenException } from '@nestjs/common';

@Controller('articles')
export class ArticlesController {
  @Put(':slug/view')
  @UseGuards(JwtGuard)
  async viewArticle(@GetUser() user: User, @Param('slug') slug: string) {
    const article = await this.articleService.findArticle(user, slug);
    
    // PaywallCheck
    if (article.hasPaywall) {
      const membership = await this.membershipService.getMembership(
        user.username,
      );
      if (
        !membership ||
        membership.tier === 'SILVER' ||
        membership.tier === 'FREE'
      ) {
        return { article: {} };
      }
    }

    // Don't count author's own views
    if (article.author.username === user.username) {
      return { article };
    }

    // Calculate revenue if article has paywall
    let revenueEarned = 0;
    if (article.hasPaywall) {
      const authorMembership = await this.membershipService.getMembership(
        article.author.username,
      );
      if (authorMembership) {
        revenueEarned = authorMembership.tier === 'GOLD' ? 0.25 : 0.10;
        await this.membershipService.addRevenue(
          article.author.username,
          revenueEarned,
        );
      }
    }

    const updatedArticle = await this.articleService.incrementViews(
      slug,
      user.id,
      revenueEarned,
    );

    return { article: updatedArticle };
  }
  @Put(':slug/paywall')
  @UseGuards(JwtGuard)
  async togglePaywall(@GetUser() user: User, @Param('slug') slug: string) {
    const hasGoldAccess = await this.membershipService.hasGoldAccess(user);
    if (!hasGoldAccess) {
      throw new ForbiddenException(
        'Only gold members can toggle article paywall',
      );
    }

    const article = await this.articleService.findArticle(user, slug);
    const updatedArticle = await this.articleService.updateArticle(user, slug, {
      hasPaywall: !article.hasPaywall,
    });
    return { article: updatedArticle };
  }

  constructor(
    private articleService: ArticlesService,
    private membershipService: MembershipService,
  ) {}

  @Get()
  @UseGuards(JwtGuard)
  @AllowAny()
  async getAllArticles(
    @GetUser() user: User,
    //filter by tag
    @Query('tag') tag?: string,
    //filter by author
    @Query('author') author?: string,
    //favorited by user
    @Query('favorited') favorited?: string,
    //limit number of articles returned
    @Query('limit') limit = 10,
    //skip number of articles
    @Query('offset') offset = 0,
  ) {
    const articles = await this.articleService.findArticles(
      user,
      tag,
      author,
      favorited,
      limit,
      offset,
    );
    return {
      articles: articles,
      articlesCount: articles.length,
    };
  }

  @UseGuards(JwtGuard)
  @Get('feed')
  async getUserFeed(
    @GetUser() user: User,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const articles = await this.articleService.getUserFeed(user, limit, offset);
    return {
      articles: articles,
      articlesCount: articles.length,
    };
  }

  @UseGuards(JwtGuard)
  @Get(':slug')
  @AllowAny()
  async getArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return { article: await this.articleService.findArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Post()
  async createArticle(@GetUser() user: User, @Body('article') dto) {
    return {
      article: await this.articleService.createArticle(user, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Put(':slug')
  async updateArticle(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Body() dto,
  ) {
    return {
      article: await this.articleService.updateArticle(user, slug, dto.article),
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @Delete(':slug')
  deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/comments')
  async addCommentToArticle(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Body() dto,
  ) {
    return {
      comment: await this.articleService.addCommentToArticle(
        user,
        slug,
        dto.comment,
      ),
    };
  }

  @UseGuards(JwtGuard)
  @Get(':slug/comments')
  @AllowAny()
  async getCommentsForArticle(
    @Param('slug') slug: string,
    @GetUser() user: User | null,
  ) {
    return {
      comments: await this.articleService.getCommentsForArticle(slug, user),
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/comments/:id')
  deleteComment(@Param('slug') slug: string, @Param('id') id: string) {
    return this.articleService.deleteCommentForArticle(slug, id);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/favorite')
  async favoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return { article: await this.articleService.favouriteArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/favorite')
  async unfavoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return {
      article: await this.articleService.unfavouriteArticle(user, slug),
    };
  }
}
