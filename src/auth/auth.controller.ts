import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, UserForRegistration } from './dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async loginUser(@Body('user') dto: LoginDto) {
    const user = await this.authService.verifyUser(dto);
    return { user: user };
  }

  @Post()
  async registerUser(@Body('user') dto: UserForRegistration) {
    const user = await this.authService.createUser(dto);
    return { user: user };
  }
}
