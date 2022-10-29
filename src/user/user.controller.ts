import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { UserForUpdate } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getCurrentUser(@GetUser() user: User) {
    return { user: user };
  }

  @Put()
  async updateUser(@GetUser() user: User, @Body('user') dto: UserForUpdate) {
    return { user: await this.userService.updateUser(user, dto) };
  }
}
