import { User } from '@prisma/client';
export interface ProfileDto {
    username: string;
    bio: string;
    image: string;
    following: boolean;
    hasPaywall: boolean;
}
export declare function castToProfile(user: User, isFollowing: boolean): ProfileDto;
