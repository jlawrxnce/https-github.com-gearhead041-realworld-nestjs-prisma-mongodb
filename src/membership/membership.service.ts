import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipData, MembershipResponse } from './dto/membership.dto';
import { User, Tier } from '@prisma/client';


@Injectable()
export class MembershipService {
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
      totalRevenue: membership.totalRevenue || 0,
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

    if (membership.tier === 'Free') {
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
      tier: updatedMembership.tier as Tier,
      renewalDate: updatedMembership.renewalDate,
      autoRenew: updatedMembership.autoRenew,
      totalRevenue: updatedMembership.totalRevenue,
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
      };
    }
    return {
      username: user.username,
      tier: user.membership.tier as Tier,
      renewalDate: user.membership.renewalDate,
      autoRenew: user.membership.autoRenew,
      totalRevenue: user.membership.totalRevenue,
    };
  }

  async hasMembershipAccess(user: User | null): Promise<boolean> {
    if (!user) return false;

    const membership = await this.prisma.membership.findUnique({
      where: { userId: user.id },
    });

    return membership?.tier === Tier.Gold || membership?.tier === Tier.Silver;
  }
}
