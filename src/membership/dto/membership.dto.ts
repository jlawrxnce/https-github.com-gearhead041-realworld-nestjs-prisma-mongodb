export interface MembershipResponse {
  username: string;
  tier: 'FREE' | 'SILVER' | 'GOLD';
  renewalDate: Date;
  autoRenew: boolean;
  totalRevenue: number;
}

export interface MembershipData {
  tier: 'FREE' | 'SILVER' | 'GOLD';
  autoRenew?: boolean;
}

export interface MembershipRO {
  membership: MembershipResponse;
}
