import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MembershipModule } from 'src/membership/membership.module';
import { PaywallGuard } from './guard'; // assuming PaywallGuard is in the same directory

@Module({
  imports: [MembershipModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, PaywallGuard],
})
export class ArticlesModule {}
