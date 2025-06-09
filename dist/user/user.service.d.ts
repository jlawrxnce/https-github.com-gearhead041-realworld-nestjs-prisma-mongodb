import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserForUpdate } from './dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(user: User, dto: UserForUpdate): Promise<import("@prisma/client/runtime").GetResult<{
        id: string;
        email: string;
        username: string;
        bio: string;
        image: string;
        password: string;
        membershipTier: import(".prisma/client").MembershipTier;
        membershipRenewalDate: Date;
        membershipAutoRenew: boolean;
        hasPaywall: boolean;
        totalRevenue: number;
        followersIds: string[];
        followingIds: string[];
        articlesLikedIds: string[];
        viewedArticleIds: string[];
    }, unknown, never> & {}>;
}
