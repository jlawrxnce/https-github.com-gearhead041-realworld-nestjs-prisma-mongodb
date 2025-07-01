import {
  Injectable,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  MembershipDto,
  MembershipTier,
  MembershipUpdateDto,
  castToMembershipDto,
} from './dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async activateMembership(
    user: User,
    tier: MembershipTier,
  ): Promise<MembershipDto> {
    if (tier === MembershipTier.Free) {
      throw new UnprocessableEntityException(
        'Cannot activate Free tier membership',
      );
    }

    // Set renewal date based on tier (7 days for Trial, 30 days for Gold)
    const daysToAdd = tier === MembershipTier.Trial ? 7 : 30;
    const renewalDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const membership = await this.prisma.membership.upsert({
      where: {
        userId: user.id,
      },
      update: {
        tier,
        renewalDate,
      },
      create: {
        userId: user.id,
        tier,
        renewalDate,
      },
    });

    return castToMembershipDto(membership, user.username);
  }

  async updateMembership(
    user: User,
    dto: MembershipUpdateDto,
  ): Promise<MembershipDto> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!membership || membership.tier === MembershipTier.Free) {
      throw new ForbiddenException('Only paid members can update membership');
    }

    // If a Gold user tries to update to Free, just turn off auto-renewal without changing tier
    let tierToUpdate = dto.tier;
    if (
      membership.tier === MembershipTier.Gold.toString() &&
      dto.tier === MembershipTier.Free
    ) {
      tierToUpdate = MembershipTier.Gold;
    }

    const updatedMembership = await this.prisma.membership.update({
      where: {
        userId: user.id,
      },
      data: {
        tier: tierToUpdate,
        autoRenew: dto.tier === MembershipTier.Free ? false : dto.autoRenew,
      },
    });

    return castToMembershipDto(updatedMembership, user.username);
  }

  async getMembership(user: User): Promise<MembershipDto> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!membership) {
      // Return default free membership if none exists
      return {
        username: user.username,
        tier: MembershipTier.Free,
        renewalDate: new Date(),
        autoRenew: false,
        totalRevenue: 0,
      };
    }

    return castToMembershipDto(membership, user.username);
  }

  async checkPaidMembership(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId,
      },
    });

    return (
      membership?.tier === MembershipTier.Gold.toString() ||
      membership?.tier === MembershipTier.Trial.toString()
    );
  }
  
  async checkGoldMembership(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId,
      },
    });

    return membership?.tier === MembershipTier.Gold.toString();
  }

  async addRevenue(userId: string, amount: number): Promise<void> {
    await this.prisma.membership.update({
      where: { userId },
      data: {
        totalRevenue: {
          increment: amount,
        },
      },
    });
  }

  async incrementActivePaywalls(userId: string): Promise<number> {
    const membership = await this.prisma.membership.update({
      where: { userId },
      data: {
        activePaywalls: {
          increment: 1,
        },
      },
    });
    return membership.activePaywalls;
  }

  async decrementActivePaywalls(userId: string): Promise<number> {
    const membership = await this.prisma.membership.update({
      where: { userId },
      data: {
        activePaywalls: {
          decrement: 1,
        },
      },
    });
    return membership.activePaywalls;
  }

  async incrementTotalViews(userId: string): Promise<void> {
    await this.prisma.membership.update({
      where: { userId },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });
  }

  async renewMembership(user: User): Promise<MembershipDto> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!membership || membership.tier === MembershipTier.Free.toString()) {
      throw new ForbiddenException('Only paid members can renew membership');
    }

    // Check if renewal date is too far in the future (more than 75 days from now)
    const maxRenewalDate = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000);
    const newRenewalDate = new Date(
      membership.renewalDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    
    if (newRenewalDate > maxRenewalDate) {
      throw new ForbiddenException(
        'Cannot renew membership more than 75 days in advance',
      );
    }

    // If Trial user renews, upgrade to Gold immediately
    let updatedTier = membership.tier;
    if (membership.tier === MembershipTier.Trial.toString()) {
      updatedTier = MembershipTier.Gold.toString();
    }

    const updatedMembership = await this.prisma.membership.update({
      where: {
        userId: user.id,
      },
      data: {
        tier: updatedTier,
        renewalDate: newRenewalDate,
      },
    });

    return castToMembershipDto(updatedMembership, user.username);
  }
}
