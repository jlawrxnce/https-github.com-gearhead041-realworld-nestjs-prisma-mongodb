import { Membership } from '@prisma/client';
export declare enum MembershipTier {
    Free = "Free",
    Silver = "Silver",
    Gold = "Gold"
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
export declare function castToMembershipDto(membership: Membership, username: string): MembershipDto;
