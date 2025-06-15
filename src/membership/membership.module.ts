import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ArticleModule } from '../article/article.module';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
  imports: [PrismaModule, ArticleModule],
})
export class MembershipModule {}
