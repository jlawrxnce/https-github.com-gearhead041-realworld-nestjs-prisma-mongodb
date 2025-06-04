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
import { JwtGuard, PaywallGuard } from '../common/guard';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  @UseGuards(JwtGuard)
  @Put(':slug/paywall')
  async togglePaywall(
    @GetUser() user: User,
    @Param('slug') slug: string,
  ) {
    return {
      article: await this.articleService.togglePaywall(user, slug),
    };
  }
  constructor(private articleService: ArticlesService) {}

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

  @Get(':slug')
  @UseGuards(PaywallGuard)
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

  @UseGuards(JwtGuard, PaywallGuard)
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

  @Get(':slug/comments')
  async getCommentsForArticle(@Param('slug') slug: string) {
    return { comments: await this.articleService.getCommentsForArticle(slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/comments/:id')
  deleteComment(@Param('slug') slug: string, @Param('id') id: string) {
    return this.articleService.deleteCommentForArticle(slug, id);
  }

  @UseGuards(JwtGuard, PaywallGuard)
  @Post(':slug/favorite')
  async favoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return { article: await this.articleService.favouriteArticle(user, slug) };
  }

  @UseGuards(JwtGuard, PaywallGuard)
  @Delete(':slug/favorite')
  async unfavoriteArticle(@GetUser() user: User, @Param('slug') slug: string) {
    return {
      article: await this.articleService.unfavouriteArticle(user, slug),
    };
  }
}
