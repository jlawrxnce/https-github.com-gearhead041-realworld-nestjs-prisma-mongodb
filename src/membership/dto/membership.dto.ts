import { MembershipTier } from '@prisma/client';

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

export interface MembershipActivateDto {
  tier: MembershipTier;
}
