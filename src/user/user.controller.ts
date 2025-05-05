import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetToken } from 'src/common/decorator/get-token.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { UserForUpdate } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getCurrentUser(@GetUser() user: User, @GetToken() token: string) {
    return { user: { ...user, token } };
  }

  @Put()
  async updateUser(
    @GetUser() user: User,
    @Body('user') dto: UserForUpdate,
    @GetToken() token: string,
  ) {
    const updatedUser = await this.userService.updateUser(user, dto);
    return { user: { ...updatedUser, token } };
  }
}
