import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipData, MembershipResponse } from './dto/membership.dto';
import { User, Tier } from '@prisma/client';


@Injectable()
export class MembershipService {
  private readonly TRIAL_DURATION_DAYS = 7;
  private readonly MEMBERSHIP_CYCLE_DAYS = 30;
  private readonly MAX_RENEWAL_DAYS = 75;
  private readonly TRIAL_MAX_PAYWALLS = 3;
  async addRevenue(username: string, amount: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { membership: true },
    });

    if (!user || !user.membership) {
      throw new NotFoundException('User membership not found');
    }

    await this.prisma.membership.update({
      where: { userId: user.id },
      data: {
        totalRevenue: { increment: amount },
      },
    });
  }
  constructor(private prisma: PrismaService) {}

  async createMembership(
    user: User,
    data: MembershipData,
  ): Promise<MembershipResponse> {
    if (data.tier === 'Free') {
      throw new ForbiddenException('Cannot activate Free tier membership');
    }

    const renewalDate = new Date();
    if (data.tier === 'Trial') {
      renewalDate.setDate(renewalDate.getDate() + this.TRIAL_DURATION_DAYS);
    } else {
      renewalDate.setDate(renewalDate.getDate() + this.MEMBERSHIP_CYCLE_DAYS);
    }

    const membership = await this.prisma.membership.create({
      data: {
        tier: data.tier,
        autoRenew: data.autoRenew ?? false,
        renewalDate: renewalDate,
        userId: user.id,
        activePaywallCount: 0,
        totalViews: 0,
      },
      include: {
        user: true,
      },
    });
    return this.toMembershipResponse(membership);
  }

  async updateMembership(
    user: User,
    data: MembershipData,
  ): Promise<MembershipResponse> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!membership) {
      throw new ForbiddenException('Free tier users cannot update membership');
    }

    if (membership.tier === 'Free') {
      throw new ForbiddenException('Free tier users cannot update membership');
    }

    if (membership.tier === 'Gold' && data.tier === 'Trial') {
      throw new UnprocessableEntityException('Gold users cannot downgrade to Trial tier');
    }

    const updatedMembership = await this.prisma.membership.update({
      where: { userId: user.id },
      data: {
        tier: data.tier,
        autoRenew: data.tier === 'Free' ? false : 
          (data.autoRenew !== undefined ? data.autoRenew : membership.autoRenew),
      },
      include: { user: true },
    });

    return this.toMembershipResponse(updatedMembership);
  }

  private toMembershipResponse(membership: any): MembershipResponse {
    return {
      username: membership.user.username,
      tier: membership.tier as Tier,
      renewalDate: membership.renewalDate,
      autoRenew: membership.autoRenew,
      totalRevenue: membership.totalRevenue || 0,
      totalViews: membership.tier === 'Free' ? null : membership.totalViews || 0,
    };
  }

  async getMembership(username: string): Promise<MembershipResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { membership: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.membership) {
      return {
        username: user.username,
        tier: 'Free',
        renewalDate: new Date(),
        autoRenew: false,
        totalRevenue: 0,
        totalViews: null,
      };
    }
    return this.toMembershipResponse(user.membership);
  }

  async renewMembership(user: User): Promise<MembershipResponse> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!membership) {
      throw new ForbiddenException('Free tier users cannot renew membership');
    }

    if (membership.tier === 'Free') {
      throw new ForbiddenException('Free tier users cannot renew membership');
    }

    const currentDate = new Date();
    const maxRenewalDate = new Date(currentDate.getTime());
    maxRenewalDate.setDate(currentDate.getDate() + this.MAX_RENEWAL_DAYS);

    if (membership.renewalDate > maxRenewalDate) {
      throw new ForbiddenException(
        'Cannot renew membership more than 75 days in advance',
      );
    }

    const newRenewalDate = new Date(membership.renewalDate.getTime());
    
    if (membership.tier === 'Trial') {
      // Trial users get upgraded to Gold immediately
      newRenewalDate.setDate(
        currentDate.getDate() + this.MEMBERSHIP_CYCLE_DAYS,
      );
      
      const updatedMembership = await this.prisma.membership.update({
        where: { userId: user.id },
        data: {
          tier: 'Gold',
          renewalDate: newRenewalDate,
        },
        include: { user: true },
      });
      
      return this.toMembershipResponse(updatedMembership);
    }

    // For Gold users, extend by 30 days from current renewal date
    newRenewalDate.setDate(
      newRenewalDate.getDate() + this.MEMBERSHIP_CYCLE_DAYS,
    );
    
    const updatedMembership = await this.prisma.membership.update({
      where: { userId: user.id },
      data: {
        renewalDate: newRenewalDate,
      },
      include: { user: true },
    });

    return this.toMembershipResponse(updatedMembership);
  }

  async incrementArticleViews(articleId: string): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: { include: { membership: true } } },
    });

    if (!article || !article.author.membership) return;

    await this.prisma.membership.update({
      where: { userId: article.author.id },
      data: {
        totalViews: { increment: 1 },
      },
    });
  }

  async canSetPaywall(userId: string): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership || membership.tier === 'Free') {
      return false;
    }

    if (
      membership.tier === 'Trial' &&
      membership.activePaywallCount >= this.TRIAL_MAX_PAYWALLS
    ) {
      return false;
    }

    return true;
  }

  async updatePaywallCount(userId: string, increment: boolean): Promise<void> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership) return;

    await this.prisma.membership.update({
      where: { userId },
      data: {
        activePaywallCount: {
          [increment ? 'increment' : 'decrement']: 1,
        },
      },
    });
  }

  async hasMembershipAccess(user: User | null): Promise<boolean> {
    if (!user) return false;

    const membership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
    });

    return membership?.tier === Tier.Gold || membership?.tier === Tier.Silver;
  }
}
