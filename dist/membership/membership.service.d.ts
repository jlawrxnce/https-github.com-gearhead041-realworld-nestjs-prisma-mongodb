import { PrismaService } from '../prisma/prisma.service';
import { MembershipDto, MembershipUpdateDto, MembershipActivateDto } from './dto/membership.dto';
import { User } from '@prisma/client';
export declare class MembershipService {
    private prisma;
    constructor(prisma: PrismaService);
    activateMembership(user: User, dto: MembershipActivateDto): Promise<MembershipDto>;
    updateMembership(user: User, dto: MembershipUpdateDto): Promise<MembershipDto>;
    getMembership(user: User): Promise<MembershipDto>;
}
