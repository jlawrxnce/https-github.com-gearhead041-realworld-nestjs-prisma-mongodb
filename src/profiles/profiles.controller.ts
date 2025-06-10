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
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { ProfilesService } from './profiles.service';
import { AllowAny } from 'src/common/decorator';
import { PaywallGuard } from 'src/articles/guard';

@UseGuards(JwtGuard, PaywallGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profileService: ProfilesService) {}
  @Get(':username')
  @AllowAny()
  async findUser(@GetUser() user: User, @Param('username') userName: string) {
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
