export interface MembershipResponse {
    username: string;
    tier: 'Free' | 'Trial' | 'Gold';
    renewalDate: Date;
    autoRenew: boolean;
    totalRevenue: number;
    totalViews: number | null;
}
export interface MembershipData {
    tier: 'Free' | 'Trial' | 'Gold';
    autoRenew?: boolean;
}
export interface MembershipRO {
    membership: MembershipResponse;
}
