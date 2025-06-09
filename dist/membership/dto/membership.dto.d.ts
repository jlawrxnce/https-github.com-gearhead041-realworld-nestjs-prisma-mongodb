import { Membership } from '@prisma/client';
export declare enum MembershipTier {
    Free = "Free",
    Gold = "Gold"
}
export interface MembershipDto {
    username: string;
    tier: MembershipTier;
    renewalDate: Date;
    autoRenew: boolean;
}
export interface MembershipActivateDto {
    tier: MembershipTier;
}
export interface MembershipUpdateDto {
    tier: MembershipTier;
    autoRenew: boolean;
}
export declare function castToMembershipDto(membership: Membership, username: string): MembershipDto;
