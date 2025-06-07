import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private config;
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        id: string;
        email: string;
        bio: string;
        username: string;
        followers: (import("@prisma/client/runtime").GetResult<{
            id: string;
            email: string;
            username: string;
            bio: string;
            image: string;
            password: string;
            membershipTier: import(".prisma/client").MembershipTier;
            membershipRenewalDate: Date;
            membershipAutoRenew: boolean;
            followersIds: string[];
            followingIds: string[];
            articlesLikedIds: string[];
        }, unknown, never> & {})[];
        image: string;
    }>;
}
export {};
