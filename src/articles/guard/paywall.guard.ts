import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipService } from '../../membership/membership.service';

@Injectable()
export class PaywallGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private membershipService: MembershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const slug = request.params.slug;
    const user = request.user;

    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return true; // Let the controller handle 404
    }

    if (!article.hasPaywall) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException(
        'This content requires Silver or Gold membership',
      );
    }

    const membership = await this.membershipService.getMembership(user.id);
    if (!membership || membership.tier === 'Free') {
      throw new ForbiddenException(
        'This content requires Silver or Gold membership',
      );
    }

    return true;
  }
}
