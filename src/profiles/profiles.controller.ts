import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AllowAny } from 'src/common/decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { ProfilesService } from './profiles.service';

@UseGuards(JwtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profileService: ProfilesService) {}
  @Get(':username')
  @AllowAny()
  async findUser(
    @GetUser() user: User | null,
    @Param('username') userName: string,
  ) {
    return { profile: await this.profileService.findUser(user, userName) };
  }

  @HttpCode(HttpStatus.OK)
  @Post(':username/follow')
  async followUser(@GetUser() user: User, @Param('username') userName: string) {
    return { profile: await this.profileService.followUser(user, userName) };
  }

  @Delete(':username/follow')
  async unfollowUser(
    @GetUser() user: User,
    @Param('username') username: string,
  ) {
    return { profile: await this.profileService.unfollowUser(user, username) };
  }
}
