import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipService } from '../../membership/membership.service';
export declare class PaywallGuard implements CanActivate {
    private prisma;
    private membershipService;
    constructor(prisma: PrismaService, membershipService: MembershipService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
