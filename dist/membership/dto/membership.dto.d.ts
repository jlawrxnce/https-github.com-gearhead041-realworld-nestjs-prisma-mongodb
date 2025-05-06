import { Tier } from '@prisma/client';
export interface MembershipResponse {
    username: string;
    tier: Tier;
    renewalDate: Date;
    autoRenew: boolean;
}
export interface MembershipData {
    tier: Tier;
    autoRenew?: boolean;
}
export interface MembershipRO {
    membership: MembershipResponse;
}
