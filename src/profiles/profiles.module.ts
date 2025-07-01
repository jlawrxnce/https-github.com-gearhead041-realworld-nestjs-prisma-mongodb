import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { MembershipModule } from 'src/membership/membership.module';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  imports: [MembershipModule],
})
export class ProfilesModule {}
