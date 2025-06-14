export interface MembershipResponse {
  username: string;
  tier: 'Free' | 'Silver' | 'Gold';
  renewalDate: Date;
  autoRenew: boolean;
  totalRevenue: number;
}

export interface MembershipData {
  tier: 'Free' | 'Silver' | 'Gold';
  autoRenew?: boolean;
}

export interface MembershipRO {
  membership: MembershipResponse;
}
