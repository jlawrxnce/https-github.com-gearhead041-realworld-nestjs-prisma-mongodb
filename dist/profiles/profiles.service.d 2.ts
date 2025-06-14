import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileDto } from './dto';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    findUser(user: User, userName: string): Promise<ProfileDto>;
    followUser(user: User, userName: string): Promise<ProfileDto>;
    unfollowUser(user: User, username: string): Promise<ProfileDto>;
}
