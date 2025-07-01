import { Prisma } from '@prisma/client';

type Membership = Prisma.MembershipGetPayload<Record<string, never>>;

export enum MembershipTier {
  Free = 'Free',
  Trial = 'Trial',
  Gold = 'Gold',
}

export interface MembershipDto {
  username: string;
  tier: MembershipTier;
  renewalDate: Date;
  autoRenew: boolean;
  totalRevenue: number;
  totalViews: number | null;
  activePaywalls: number;
}

export interface MembershipActivateDto {
  tier: MembershipTier;
}

export interface MembershipUpdateDto {
  tier: MembershipTier;
  autoRenew: boolean;
}

export function castToMembershipDto(
  membership: any,
  username: string,
): MembershipDto {
  if (!membership) {
    return {
      username,
      tier: MembershipTier.Free,
      renewalDate: new Date(),
      autoRenew: false,
      totalRevenue: 0,
      totalViews: null,
      activePaywalls: 0,
    };
  }

  return {
    username,
    tier: membership.tier as MembershipTier,
    renewalDate: membership.renewalDate,
    autoRenew: membership.autoRenew,
    totalRevenue: membership.totalRevenue,
    totalViews: membership.tier === MembershipTier.Free.toString()
      ? null
      : membership.totalViews,
    activePaywalls: membership.activePaywalls,
  };
}
