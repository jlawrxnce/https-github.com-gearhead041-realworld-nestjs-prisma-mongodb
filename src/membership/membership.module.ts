import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
  imports: [PrismaModule],
})
export class MembershipModule {}
