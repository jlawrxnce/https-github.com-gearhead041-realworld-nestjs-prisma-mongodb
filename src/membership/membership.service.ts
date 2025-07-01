import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MembershipDto,
  MembershipUpdateDto,
  MembershipActivateDto,
  MembershipTier,
} from './dto/membership.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async activateMembership(
    user: User,
    dto: MembershipActivateDto,
  ): Promise<MembershipDto> {
    if (dto.tier === MembershipTier.Free) {
      throw new UnprocessableEntityException('Cannot activate Free tier');
    }

    const renewalDate = new Date();
    // Set renewal date based on tier: 7 days for Trial, 30 days for Gold
    if (dto.tier === MembershipTier.Trial) {
      renewalDate.setDate(renewalDate.getDate() + 7);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: dto.tier,
        membershipRenewalDate: renewalDate,
      },
    });

    return this.formatMembershipResponse(updatedUser);
  }

  async updateMembership(
    user: User,
    dto: MembershipUpdateDto,
  ): Promise<MembershipDto> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!currentUser) {
      throw new ForbiddenException('User not found');
    }

    if (currentUser.membershipTier === 'Free') {
      throw new ForbiddenException('Free tier users cannot update membership');
    }

    // Gold users cannot demote to Trial
    if (
      currentUser.membershipTier === 'Gold' &&
      dto.tier === MembershipTier.Trial
    ) {
      throw new UnprocessableEntityException(
        'Gold users cannot downgrade to Trial tier',
      );
    }

    // If Gold user updates to Free, just turn off auto-renewal without demoting
    if (
      currentUser.membershipTier === 'Gold' &&
      dto.tier === MembershipTier.Free
    ) {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          membershipAutoRenew: false,
        },
      });
      return this.formatMembershipResponse(updatedUser);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: dto.tier,
        membershipAutoRenew: dto.autoRenew,
      },
    });

    return this.formatMembershipResponse(updatedUser);
  }

  async getMembership(user: User): Promise<MembershipDto> {
    const userWithMembership = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithMembership) {
      throw new ForbiddenException('User not found');
    }

    return this.formatMembershipResponse(userWithMembership);
  }

  async renewMembership(user: User): Promise<MembershipDto> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!currentUser) {
      throw new ForbiddenException('User not found');
    }

    if (currentUser.membershipTier === 'Free') {
      throw new ForbiddenException('Free tier users cannot renew membership');
    }

    // Calculate the new renewal date
    let newRenewalDate: Date;

    // For Trial users, upgrade to Gold immediately
    if (currentUser.membershipTier === 'Trial') {
      newRenewalDate = currentUser.membershipRenewalDate;
      newRenewalDate.setDate(newRenewalDate.getDate() + 30);

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          membershipTier: 'Gold',
          membershipRenewalDate: newRenewalDate,
        },
      });

      return this.formatMembershipResponse(updatedUser);
    }

    // For Gold users with active membership
    if (currentUser.membershipRenewalDate) {
      const currentRenewalDate = new Date(currentUser.membershipRenewalDate);
      newRenewalDate = new Date(currentRenewalDate);
      newRenewalDate.setDate(newRenewalDate.getDate() + 30);

      // Check if renewal is too far in the future (more than 75 days)
      const maxAllowedRenewalDate = new Date();
      maxAllowedRenewalDate.setDate(maxAllowedRenewalDate.getDate() + 75);

      if (newRenewalDate > maxAllowedRenewalDate) {
        throw new ForbiddenException(
          'Cannot renew membership more than 75 days in advance',
        );
      }
    } else {
      // If no renewal date exists, set it to 30 days from now
      newRenewalDate = new Date();
      newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipRenewalDate: newRenewalDate,
      },
    });

    return this.formatMembershipResponse(updatedUser);
  }

  async toggleArticlePaywall(user: User, articleId: string): Promise<any> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { articles: true },
    });

    if (!currentUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if article belongs to user
    const article = currentUser.articles.find((a) => a.id === articleId);
    if (!article) {
      throw new ForbiddenException(
        'You can only toggle paywall on your own articles',
      );
    }

    // Trial users can only have 3 active paywalls
    if (
      currentUser.membershipTier === 'Trial' &&
      !article.hasPaywall &&
      currentUser.activePaywalls >= 3
    ) {
      throw new ForbiddenException(
        'Trial users cannot have more than 3 active paywalls',
      );
    }

    // Free users cannot have paywalls
    if (currentUser.membershipTier === 'Free') {
      throw new ForbiddenException('Free tier users cannot use paywalls');
    }

    // Toggle paywall status
    const newPaywallStatus = !article.hasPaywall;
    const activePaywallsDelta = newPaywallStatus ? 1 : -1;

    const [updatedArticle] = await Promise.all([
      this.prisma.article.update({
        where: { id: articleId },
        data: { hasPaywall: newPaywallStatus },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          activePaywalls: {
            increment: activePaywallsDelta,
          },
        },
      }),
    ]);

    return updatedArticle;
  }

  async trackArticleView(articleId: string, viewerId: string): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!article) return;

    // Update article view count
    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        numViews: { increment: 1 },
        viewerIds: { push: viewerId },
      },
    });

    // Update author's total views if they have Gold or Trial membership
    if (
      article.author.membershipTier === 'Gold' ||
      article.author.membershipTier === 'Trial'
    ) {
      await this.prisma.user.update({
        where: { id: article.authorId },
        data: {
          totalViews: { increment: 1 },
          // If article has paywall, add revenue
          totalRevenue: article.hasPaywall ? { increment: 0.25 } : undefined,
        },
      });
    }
  }

  // Helper method to format membership response
  private formatMembershipResponse(user: User): MembershipDto {
    return {
      username: user.username,
      tier: user.membershipTier as unknown as MembershipTier,
      renewalDate: user.membershipRenewalDate,
      autoRenew: user.membershipAutoRenew,
      totalRevenue: user.totalRevenue,
      // Only show totalViews for Gold and Trial members
      totalViews: user.membershipTier === 'Free' ? null : user.totalViews,
    };
  }
}
