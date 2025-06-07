import { User } from '@prisma/client';
import { ProfilesService } from './profiles.service';
export declare class ProfilesController {
    private profileService;
    constructor(profileService: ProfilesService);
    findUser(user: User | null, userName: string): Promise<{
        profile: import("./dto").ProfileDto;
    }>;
    followUser(user: User, userName: string): Promise<{
        profile: import("./dto").ProfileDto;
    }>;
    unfollowUser(user: User, username: string): Promise<{
        profile: import("./dto").ProfileDto;
    }>;
}
