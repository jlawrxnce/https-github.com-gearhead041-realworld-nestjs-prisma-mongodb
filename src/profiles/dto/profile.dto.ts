import { User } from '@prisma/client';

export interface ProfileDto {
  username: string;
  bio: string;
  image: string;
  following: boolean;
  hasPaywall: boolean;
}

export function castToProfile(user: User, isFollowing: boolean): ProfileDto {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: isFollowing,
    hasPaywall: user.hasPaywall || false,
  };
}
