import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../common/decorator';
import { JwtGuard } from '../common/guard';
import { MembershipService } from './membership.service';
import { MembershipData, MembershipRO } from './dto/membership.dto';

@Controller('membership')
@UseGuards(JwtGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  async activateMembership(
    @GetUser() user: User,
    @Body('membership') membershipData: MembershipData,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.createMembership(
      user,
      membershipData,
    );
    return { membership };
  }

  @Get()
  async getCurrentMembership(@GetUser() user: User): Promise<MembershipRO> {
    const membership = await this.membershipService.getMembership(
      user.username,
    );
    return { membership };
  }

  @Get(':username')
  async getMembership(
    @Param('username') username: string,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.getMembership(username);
    return { membership };
  }

  @Put()
  async updateMembership(
    @GetUser() user: User,
    @Body('membership') membershipData: MembershipData,
  ): Promise<MembershipRO> {
    const membership = await this.membershipService.updateMembership(
      user,
      membershipData,
    );
    return { membership };
  }

  @Put('renew')
  async renewMembership(@GetUser() user: User): Promise<MembershipRO> {
    const membership = await this.membershipService.renewMembership(user);
    return { membership };
  }
}
