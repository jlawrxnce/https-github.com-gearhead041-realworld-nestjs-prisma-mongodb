import { PrismaService } from '../prisma/prisma.service';
import { MembershipData, MembershipResponse } from './dto/membership.dto';
import { User } from '@prisma/client';
export declare class MembershipService {
    private prisma;
    private readonly TRIAL_DURATION_DAYS;
    private readonly MEMBERSHIP_CYCLE_DAYS;
    private readonly MAX_RENEWAL_DAYS;
    private readonly TRIAL_MAX_PAYWALLS;
    addRevenue(username: string, amount: number): Promise<void>;
    constructor(prisma: PrismaService);
    createMembership(user: User, data: MembershipData): Promise<MembershipResponse>;
    updateMembership(user: User, data: MembershipData): Promise<MembershipResponse>;
    private toMembershipResponse;
    getMembership(username: string): Promise<MembershipResponse>;
    renewMembership(user: User): Promise<MembershipResponse>;
    incrementArticleViews(slug: string): Promise<void>;
    canSetPaywall(userId: string): Promise<boolean>;
    updatePaywallCount(userId: string, increment: boolean): Promise<void>;
    hasMembershipAccess(user: User | null): Promise<boolean>;
}
