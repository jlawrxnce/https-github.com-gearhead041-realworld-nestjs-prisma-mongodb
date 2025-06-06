import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipData, MembershipResponse } from './dto/membership.dto';
import { Tier, User } from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async createMembership(
    user: User,
    data: MembershipData,
  ): Promise<MembershipResponse> {
    if (data.tier === Tier.Free) {
      throw new ForbiddenException('Cannot activate Free tier membership');
    }

    const renewalDate = new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    );
    const membership = await this.prisma.membership.create({
      data: {
        tier: data.tier,
        autoRenew: data.autoRenew ?? false,
        renewalDate: renewalDate,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    return {
      username: membership.user.username,
      tier: membership.tier,
      renewalDate: membership.renewalDate,
      autoRenew: membership.autoRenew,
    };
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

    if (membership.tier === Tier.Free) {
      throw new ForbiddenException('Free tier users cannot update membership');
    }

    const updatedMembership = await this.prisma.membership.update({
      where: { userId: user.id },
      data: {
        tier: data.tier,
        autoRenew:
          data.autoRenew !== undefined ? data.autoRenew : membership.autoRenew,
      },
      include: { user: true },
    });

    return {
      username: updatedMembership.user.username,
      tier: updatedMembership.tier,
      renewalDate: updatedMembership.renewalDate,
      autoRenew: updatedMembership.autoRenew,
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
        tier: Tier.Free,
        renewalDate: new Date(),
        autoRenew: false,
      };
    }
    return {
      username: user.username,
      tier: user.membership.tier,
      renewalDate: user.membership.renewalDate,
      autoRenew: user.membership.autoRenew,
    };
  }

  async hasGoldAccess(user: User | null): Promise<boolean> {
    if (!user) return false;

    const membership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
    });

    return membership?.tier === Tier.Gold;
  }
}
