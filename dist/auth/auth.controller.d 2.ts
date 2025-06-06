import { AuthService } from './auth.service';
import { LoginDto, UserForRegistration } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginUser(dto: LoginDto): Promise<{
        user: import("./dto").UserDto;
    }>;
    registerUser(dto: UserForRegistration): Promise<{
        user: import("./dto").UserDto;
    }>;
}
