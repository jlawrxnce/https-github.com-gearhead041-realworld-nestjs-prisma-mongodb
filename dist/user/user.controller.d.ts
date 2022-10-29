import { User } from '@prisma/client';
import { UserForUpdate } from './dto';
import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getCurrentUser(user: User): {
        user: User;
    };
    updateUser(user: User, dto: UserForUpdate): Promise<{
        user: User;
    }>;
}
