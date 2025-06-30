export declare enum MembershipTier {
    Free = "Free",
    Trial = "Trial",
    Gold = "Gold"
}
export interface MembershipDto {
    username: string;
    tier: MembershipTier;
    renewalDate: Date;
    autoRenew: boolean;
    totalRevenue: number;
    totalViews: number | null;
}
export interface MembershipUpdateDto {
    tier: MembershipTier;
    autoRenew: boolean;
}
export interface MembershipActivateDto {
    tier: MembershipTier;
}
