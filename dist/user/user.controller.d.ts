import { User } from '@prisma/client';
import { UserForUpdate } from './dto';
import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getCurrentUser(user: User, token: string): {
        user: {
            token: string;
            id: string;
            email: string;
            username: string;
            bio: string;
            image: string;
            password: string;
            followersIds: string[];
            followingIds: string[];
            articlesLikedIds: string[];
            hasPaywall: boolean;
        };
    };
    updateUser(user: User, dto: UserForUpdate, token: string): Promise<{
        user: {
            token: string;
            id: string;
            email: string;
            username: string;
            bio: string;
            image: string;
            password: string;
            followersIds: string[];
            followingIds: string[];
            articlesLikedIds: string[];
            hasPaywall: boolean;
        };
    }>;
}
