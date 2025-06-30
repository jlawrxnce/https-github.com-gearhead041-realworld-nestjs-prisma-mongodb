import { PrismaService } from '../prisma/prisma.service';
import { MembershipDto, MembershipUpdateDto, MembershipActivateDto } from './dto/membership.dto';
import { User } from '@prisma/client';
export declare class MembershipService {
    private prisma;
    constructor(prisma: PrismaService);
    activateMembership(user: User, dto: MembershipActivateDto): Promise<MembershipDto>;
    updateMembership(user: User, dto: MembershipUpdateDto): Promise<MembershipDto>;
    getMembership(user: User): Promise<MembershipDto>;
    renewMembership(user: User): Promise<MembershipDto>;
    toggleArticlePaywall(user: User, articleId: string): Promise<any>;
    trackArticleView(articleId: string, viewerId: string): Promise<void>;
    private formatMembershipResponse;
}
