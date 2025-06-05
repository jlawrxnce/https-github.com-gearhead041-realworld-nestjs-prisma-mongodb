import { Membership } from '@prisma/client';

export enum MembershipTier {
  Free = 'Free',
  Gold = 'Gold',
}

export interface MembershipDto {
  username: string;
  tier: MembershipTier;
  renewalDate: Date;
  autoRenew: boolean;
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
    autoRenew: membership.autoRenew,
  };
}
