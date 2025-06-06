import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, UserDto, UserForRegistration } from './dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private config;
    private jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    createUser(dto: UserForRegistration): Promise<UserDto>;
    verifyUser(dto: LoginDto): Promise<UserDto>;
    signToken(userId: string, email: string): Promise<string>;
}
