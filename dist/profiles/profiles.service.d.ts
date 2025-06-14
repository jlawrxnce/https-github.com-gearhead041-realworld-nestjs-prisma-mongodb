import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileDto } from './dto';
import { MembershipService } from 'src/membership/membership.service';
export declare class ProfilesService {
    private prisma;
    private membershipService;
    constructor(prisma: PrismaService, membershipService: MembershipService);
    findUser(user: User | null, userName: string): Promise<ProfileDto>;
    followUser(user: User, userName: string): Promise<ProfileDto>;
    unfollowUser(user: User, username: string): Promise<ProfileDto>;
}
