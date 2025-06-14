import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { UserModule } from './user/user.module';
import { ArticlesModule } from './articles/articles.module';
import { ConfigModule } from '@nestjs/config';
import { MembershipModule } from './membership/membership.module';

@Module({
  imports: [
    PrismaModule,
    ProfilesModule,
    AuthModule,
    TagsModule,
    UserModule,
    MembershipModule,
    ArticlesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
