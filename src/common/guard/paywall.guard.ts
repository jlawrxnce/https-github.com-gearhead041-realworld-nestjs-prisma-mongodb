import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipTier } from '@prisma/client';

@Injectable()
export class PaywallGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const slug = request.params.slug;
    const username = request.params.username;

    if (!slug && !username) {
      return true;
    }
    if (slug) {
      const article = await this.prisma.article.findUnique({
        where: { slug },
      });

      if (!article || !article.hasPaywall) {
        return true;
      }
    }
    if (username) {
      const profile = await this.prisma.user.findUnique({
        where: { username: username },
      });

      if (!profile || !profile.hasPaywall) {
        return true;
      }
    }

    if (!user || !user.id) {
      throw new ForbiddenException('Paywalled content requires authentication');
    }

    const userWithMembership = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { membershipTier: true },
    });

    if (userWithMembership?.membershipTier === MembershipTier.Free) {
      throw new ForbiddenException('This content requires a Gold membership');
    }

    return true;
  }
}
