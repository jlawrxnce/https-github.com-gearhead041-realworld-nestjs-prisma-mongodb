import {
  Controller,
  Post,
  Put,
  Get,
  UseGuards,
  Body,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { JwtGuard } from '../common/guard';
import { GetUser } from '../common/decorator';
import { User } from '@prisma/client';
import {
  MembershipActivateDto,
  MembershipDto,
  MembershipUpdateDto,
  MembershipTier,
} from './dto';

@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Post()
  @UseGuards(JwtGuard)
  async activateMembership(
    @GetUser() user: User,
    @Body('membership') dto: MembershipActivateDto,
  ): Promise<{ membership: MembershipDto }> {
    const membership = await this.membershipService.activateMembership(
      user,
      dto.tier,
    );
    return { membership };
  }

  @Put()
  @UseGuards(JwtGuard)
  async updateMembership(
    @GetUser() user: User,
    @Body('membership') dto: MembershipUpdateDto,
  ): Promise<{ membership: MembershipDto }> {
    // Prevent Gold users from demoting to Trial
    if (
      dto.tier === MembershipTier.Trial &&
      (await this.membershipService.getMembership(user)).tier === MembershipTier.Gold
    ) {
      throw new UnprocessableEntityException(
        'Gold users cannot downgrade to Trial membership',
      );
    }

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

  @Put('renew')
  @UseGuards(JwtGuard)
  async renewMembership(
    @GetUser() user: User,
  ): Promise<{ membership: MembershipDto }> {
    const membership = await this.membershipService.renewMembership(user);
    return { membership };
  }
}
