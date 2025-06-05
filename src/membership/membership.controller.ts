import { Controller, Post, Put, Get, UseGuards, Body } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { JwtGuard } from '../common/guard';
import { GetUser } from '../common/decorator';
import { User } from '@prisma/client';
import { MembershipDto, MembershipTier, MembershipUpdateDto } from './dto';

@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Post()
  @UseGuards(JwtGuard)
  async activateMembership(
    @GetUser() user: User,
    @Body('tier') tier: MembershipTier,
  ): Promise<{ membership: MembershipDto }> {
    const membership = await this.membershipService.activateMembership(user, tier);
    return { membership };
  }

  @Put()
  @UseGuards(JwtGuard)
  async updateMembership(
    @GetUser() user: User,
    @Body() dto: MembershipUpdateDto,
  ): Promise<{ membership: MembershipDto }> {
    const membership = await this.membershipService.updateMembership(user, dto);
    return { membership };
  }

  @Get()
  @UseGuards(JwtGuard)
  async getMembership(
    @GetUser() user: User,
  ): Promise<{ membership: MembershipDto }> {
    const membership = await this.membershipService.getMembership(user);
    return { membership };
  }
}
