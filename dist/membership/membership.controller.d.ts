import { User } from '@prisma/client';
import { MembershipService } from './membership.service';
import { MembershipData, MembershipRO } from './dto/membership.dto';
export declare class MembershipController {
    private readonly membershipService;
    constructor(membershipService: MembershipService);
    activateMembership(user: User, membershipData: MembershipData): Promise<MembershipRO>;
    getCurrentMembership(user: User): Promise<MembershipRO>;
    getMembership(username: string): Promise<MembershipRO>;
    updateMembership(user: User, membershipData: MembershipData): Promise<MembershipRO>;
    renewMembership(user: User): Promise<MembershipRO>;
}
