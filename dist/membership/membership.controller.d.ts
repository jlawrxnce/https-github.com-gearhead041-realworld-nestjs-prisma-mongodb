import { User } from '@prisma/client';
import { MembershipService } from './membership.service';
import { MembershipData, MembershipRO } from './dto/membership.dto';
export declare class MembershipController {
    private membershipService;
    constructor(membershipService: MembershipService);
    activateMembership(user: User, membershipData: MembershipData): Promise<MembershipRO>;
    updateMembership(user: User, membershipData: MembershipData): Promise<MembershipRO>;
    getMembership(user: User): Promise<MembershipRO>;
}
