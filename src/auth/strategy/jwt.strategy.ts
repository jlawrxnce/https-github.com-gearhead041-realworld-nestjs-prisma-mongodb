import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('token'),
      secretOrKey: config.get('SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    //this value is appended to req.user
    //this means we can access it in the controller
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        bio: true,
        username: true,
        followers: true,
        image: true,
        hasPaywall: true,
      },
    });
    return user;
  }
}
