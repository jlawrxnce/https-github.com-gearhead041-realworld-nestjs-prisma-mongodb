import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { castToProfile, ProfileDto } from './dto';
import { MembershipService } from 'src/membership/membership.service';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private membershipService: MembershipService,
  ) {}

  async findUser(user: User | null, userName: string) {
    const userFromDb = await this.prisma.user.findUnique({
      where: {
        username: userName,
      },
    });
    if (!userFromDb) throw new NotFoundException('user not found');

    // Check paywall access
    if (userFromDb.hasPaywall && user) {
      const membership = await this.membershipService.getMembership(user.username);
      if (!membership || membership.tier === 'Free') {
        throw new ForbiddenException('Cannot access paywalled profile');
      }
    } else if (userFromDb.hasPaywall && !user) {
      throw new ForbiddenException('Cannot access paywalled profile');
    }

    const isFollowing = user ? userFromDb.followersIds.includes(user.id) : false;
    const profile: ProfileDto = castToProfile(userFromDb, isFollowing);
    return profile;
  }

  async followUser(user: User, userName: string) {
    const userToFollow = await this.findUser(user, userName);

    if (userToFollow.hasPaywall) {
      const membership = await this.membershipService.getMembership(
        user.username,
      );
      if (!membership || membership.tier === 'Free') {
        throw new ForbiddenException('user not found');
      }
    }

    const userFollowed = await this.prisma.user.update({
      where: {
        username: userName,
      },
      data: {
        followers: {
          set: [{ username: user.username }],
        },
      },
    });

    const profile: ProfileDto = castToProfile(userFollowed, true);
    return profile;
  }

  async unfollowUser(user: User, username: string) {
    const userFromDb = await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        followers: {
          disconnect: [{ id: user.id }],
        },
      },
    });

    const profile: ProfileDto = castToProfile(userFromDb, false);
    return profile;
  }
}
