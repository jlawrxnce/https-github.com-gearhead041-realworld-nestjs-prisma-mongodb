import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MembershipDto,
  MembershipUpdateDto,
  MembershipActivateDto,
} from './dto/membership.dto';
import { MembershipTier, User } from '@prisma/client';

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
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: dto.tier,
        membershipRenewalDate: renewalDate,
      },
    });

    return {
      username: updatedUser.username,
      tier: updatedUser.membershipTier,
      renewalDate: updatedUser.membershipRenewalDate,
      autoRenew: updatedUser.membershipAutoRenew,
    };
  }

  async updateMembership(
    user: User,
    dto: MembershipUpdateDto,
  ): Promise<MembershipDto> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (currentUser.membershipTier === MembershipTier.Free) {
      throw new ForbiddenException('Free tier users cannot update membership');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: dto.tier,
        membershipAutoRenew: dto.autoRenew,
      },
    });

    return {
      username: updatedUser.username,
      tier: updatedUser.membershipTier,
      renewalDate: updatedUser.membershipRenewalDate,
      autoRenew: updatedUser.membershipAutoRenew,
    };
  }

  async getMembership(user: User): Promise<MembershipDto> {
    const userWithMembership = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    return {
      username: userWithMembership.username,
      tier: userWithMembership.membershipTier,
      renewalDate: userWithMembership.membershipRenewalDate,
      autoRenew: userWithMembership.membershipAutoRenew,
    };
  }
}
