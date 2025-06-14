import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { MembershipService } from 'src/membership/membership.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, MembershipService],
})
export class ProfilesModule {}
