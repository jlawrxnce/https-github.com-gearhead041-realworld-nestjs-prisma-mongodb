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

    const membership = await this.prisma.membership.upsert({
      where: {
        userId: user.id,
      },
      update: {
        tier,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        userId: user.id,
        tier,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    const updatedMembership = await this.prisma.membership.update({
      where: {
        userId: user.id,
      },
      data: {
        tier: dto.tier,
        autoRenew: dto.autoRenew,
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

  async checkGoldMembership(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId,
      },
    });

    return membership?.tier === MembershipTier.Gold;
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
}
