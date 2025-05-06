import { PrismaService } from '../prisma/prisma.service';
import { MembershipData, MembershipResponse } from './dto/membership.dto';
import { User } from '@prisma/client';
export declare class MembershipService {
    private prisma;
    constructor(prisma: PrismaService);
    createMembership(user: User, data: MembershipData): Promise<MembershipResponse>;
    updateMembership(user: User, data: MembershipData): Promise<MembershipResponse>;
    getMembership(username: string): Promise<MembershipResponse>;
    hasGoldAccess(user: User | null): Promise<boolean>;
}
