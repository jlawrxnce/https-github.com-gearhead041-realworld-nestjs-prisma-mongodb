import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserForUpdate } from './dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    updateUser(user: User, dto: UserForUpdate): Promise<User>;
}
