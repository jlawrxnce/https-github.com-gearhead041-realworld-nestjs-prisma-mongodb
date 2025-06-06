import { User } from '@prisma/client';
import { MembershipService } from './membership.service';
import { MembershipDto, MembershipUpdateDto, MembershipActivateDto } from './dto/membership.dto';
export declare class MembershipController {
    private membershipService;
    constructor(membershipService: MembershipService);
    activateMembership(user: User, dto: MembershipActivateDto): Promise<{
        membership: MembershipDto;
    }>;
    updateMembership(user: User, dto: MembershipUpdateDto): Promise<{
        membership: MembershipDto;
    }>;
    getMembership(user: User): Promise<{
        membership: MembershipDto;
    }>;
}
