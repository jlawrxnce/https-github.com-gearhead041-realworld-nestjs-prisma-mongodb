import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../common/decorator/get-user.decorator';
import { JwtGuard } from '../common/guard';
import { MembershipService } from './membership.service';
import { MembershipDto, MembershipUpdateDto, MembershipActivateDto } from './dto/membership.dto';

@UseGuards(JwtGuard)
@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Post()
  async activateMembership(
    @GetUser() user: User,
    @Body('membership') dto: MembershipActivateDto,
  ): Promise<{ membership: MembershipDto }> {
    return {
      membership: await this.membershipService.activateMembership(user, dto),
    };
  }

  @Put()
  async updateMembership(
    @GetUser() user: User,
    @Body('membership') dto: MembershipUpdateDto,
  ): Promise<{ membership: MembershipDto }> {
    return {
      membership: await this.membershipService.updateMembership(user, dto),
    };
  }

  @Get()
  async getMembership(
    @GetUser() user: User,
  ): Promise<{ membership: MembershipDto }> {
    return {
      membership: await this.membershipService.getMembership(user),
    };
  }
}
