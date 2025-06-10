import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { MembershipDto, MembershipTier, MembershipUpdateDto } from './dto';
export declare class MembershipService {
    private prisma;
    constructor(prisma: PrismaService);
    activateMembership(user: User, tier: MembershipTier): Promise<MembershipDto>;
    updateMembership(user: User, dto: MembershipUpdateDto): Promise<MembershipDto>;
    getMembership(user: User): Promise<MembershipDto>;
    checkGoldMembership(userId: string): Promise<boolean>;
    addRevenue(userId: string, amount: number): Promise<void>;
}
