import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MembershipModule } from '../membership/membership.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [MembershipModule],
})
export class ArticlesModule {}
