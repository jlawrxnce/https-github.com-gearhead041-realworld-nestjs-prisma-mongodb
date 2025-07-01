import { Membership } from '@prisma/client';

export enum MembershipTier {
  Free = 'Free',
  Silver = 'Silver',
  Gold = 'Gold',
}

export interface MembershipDto {
  username: string;
  tier: MembershipTier;
  renewalDate: Date;
  autoRenew: boolean;
  totalRevenue: number;
}

export interface MembershipActivateDto {
  tier: MembershipTier;
}

export interface MembershipUpdateDto {
  tier: MembershipTier;
  autoRenew: boolean;
}

export function castToMembershipDto(
  membership: Membership,
  username: string,
): MembershipDto {
  return {
    username,
    tier: membership.tier as MembershipTier,
    renewalDate: membership.renewalDate,
    totalRevenue: membership.totalRevenue,
    autoRenew: membership.autoRenew,
  };
}
