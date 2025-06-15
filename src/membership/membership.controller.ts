import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../common/decorator';
import { JwtGuard } from '../common/guard';
import { MembershipService } from './membership.service';
import { MembershipData, MembershipRO } from './dto/membership.dto';
import { ArticleService } from '../article/article.service';
import { ArticleRO } from '../article/dto/article.dto';

@Controller('membership')
@UseGuards(JwtGuard)
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly articleService: ArticleService,
  ) {}

  @Post()
  async activateMembership(
    @GetUser() user: User,
    @Body('membership') membershipData: MembershipData,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.createMembership(
      user,
      membershipData,
    );
    return { membership };
  }

  @Get()
  async getCurrentMembership(@GetUser() user: User): Promise<MembershipRO> {
    const membership = await this.membershipService.getMembership(
      user.username,
    );
    return { membership };
  }

  @Get(':username')
  async getMembership(
    @Param('username') username: string,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.getMembership(username);
    return { membership };
  }

  @Put()
  async updateMembership(
    @GetUser() user: User,
    @Body('membership') membershipData: MembershipData,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.updateMembership(
      user,
      membershipData,
    );
    return { membership };
  }

  @Put('renew')
  async renewMembership(@GetUser() user: User): Promise<MembershipRO> {
    const membership = await this.membershipService.renewMembership(user);
    return { membership };
  }

  @Put('article/:slug/paywall')
  async togglePaywall(
    @GetUser() user: User,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    const canSetPaywall = await this.membershipService.canSetPaywall(user.id);
    if (!canSetPaywall) {
      throw new ForbiddenException(
        'Cannot set paywall with current membership tier',
      );
    }

    const article = await this.articleService.findBySlug(slug);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== user.id) {
      throw new ForbiddenException(
        'Only the article author can toggle paywall',
      );
    }

    // If we're enabling the paywall, check Trial tier limits
    if (!article.hasPaywall) {
      await this.membershipService.updatePaywallCount(user.id, true);
    } else {
      await this.membershipService.updatePaywallCount(user.id, false);
    }

    return this.articleService.togglePaywall(article);
  }
}
