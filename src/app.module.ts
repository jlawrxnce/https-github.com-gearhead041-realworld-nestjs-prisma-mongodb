import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { UserModule } from './user/user.module';
import { ArticlesModule } from './articles/articles.module';
import { MembershipModule } from './membership/membership.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ProfilesModule,
    AuthModule,
    TagsModule,
    UserModule,
    ArticlesModule,
    MembershipModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
