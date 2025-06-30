"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const membership_dto_1 = require("./dto/membership.dto");
let MembershipService = class MembershipService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async activateMembership(user, dto) {
        if (dto.tier === membership_dto_1.MembershipTier.Free) {
            throw new common_1.UnprocessableEntityException('Cannot activate Free tier');
        }
        const renewalDate = new Date();
        if (dto.tier === membership_dto_1.MembershipTier.Trial) {
            renewalDate.setDate(renewalDate.getDate() + 7);
        }
        else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                membershipTier: dto.tier,
                membershipRenewalDate: renewalDate,
            },
        });
        return this.formatMembershipResponse(updatedUser);
    }
    async updateMembership(user, dto) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!currentUser) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (currentUser.membershipTier === 'Free') {
            throw new common_1.ForbiddenException('Free tier users cannot update membership');
        }
        if (currentUser.membershipTier === 'Gold' &&
            dto.tier === membership_dto_1.MembershipTier.Trial) {
            throw new common_1.UnprocessableEntityException('Gold users cannot downgrade to Trial tier');
        }
        if (currentUser.membershipTier === 'Gold' &&
            dto.tier === membership_dto_1.MembershipTier.Free) {
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    membershipAutoRenew: false,
                },
            });
            return this.formatMembershipResponse(updatedUser);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                membershipTier: dto.tier,
                membershipAutoRenew: dto.autoRenew,
            },
        });
        return this.formatMembershipResponse(updatedUser);
    }
    async getMembership(user) {
        const userWithMembership = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!userWithMembership) {
            throw new common_1.ForbiddenException('User not found');
        }
        return this.formatMembershipResponse(userWithMembership);
    }
    async renewMembership(user) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!currentUser) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (currentUser.membershipTier === 'Free') {
            throw new common_1.ForbiddenException('Free tier users cannot renew membership');
        }
        let newRenewalDate;
        if (currentUser.membershipTier === 'Trial') {
            newRenewalDate = new Date();
            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    membershipTier: 'Gold',
                    membershipRenewalDate: newRenewalDate,
                },
            });
            return this.formatMembershipResponse(updatedUser);
        }
        if (currentUser.membershipRenewalDate) {
            const currentRenewalDate = new Date(currentUser.membershipRenewalDate);
            newRenewalDate = new Date(currentRenewalDate);
            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
            const maxAllowedRenewalDate = new Date();
            maxAllowedRenewalDate.setDate(maxAllowedRenewalDate.getDate() + 75);
            if (newRenewalDate > maxAllowedRenewalDate) {
                throw new common_1.ForbiddenException('Cannot renew membership more than 75 days in advance');
            }
        }
        else {
            newRenewalDate = new Date();
            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                membershipRenewalDate: newRenewalDate,
            },
        });
        return this.formatMembershipResponse(updatedUser);
    }
    async toggleArticlePaywall(user, articleId) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { articles: true },
        });
        if (!currentUser) {
            throw new common_1.ForbiddenException('User not found');
        }
        const article = currentUser.articles.find(a => a.id === articleId);
        if (!article) {
            throw new common_1.ForbiddenException('You can only toggle paywall on your own articles');
        }
        if (currentUser.membershipTier === 'Trial' &&
            !article.hasPaywall &&
            currentUser.activePaywalls >= 3) {
            throw new common_1.ForbiddenException('Trial users cannot have more than 3 active paywalls');
        }
        if (currentUser.membershipTier === 'Free') {
            throw new common_1.ForbiddenException('Free tier users cannot use paywalls');
        }
        const newPaywallStatus = !article.hasPaywall;
        const activePaywallsDelta = newPaywallStatus ? 1 : -1;
        const [updatedArticle] = await Promise.all([
            this.prisma.article.update({
                where: { id: articleId },
                data: { hasPaywall: newPaywallStatus },
            }),
            this.prisma.user.update({
                where: { id: user.id },
                data: {
                    activePaywalls: {
                        increment: activePaywallsDelta
                    }
                },
            }),
        ]);
        return updatedArticle;
    }
    async trackArticleView(articleId, viewerId) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
            include: { author: true },
        });
        if (!article)
            return;
        await this.prisma.article.update({
            where: { id: articleId },
            data: {
                numViews: { increment: 1 },
                viewerIds: { push: viewerId },
            },
        });
        if (article.author.membershipTier === 'Gold' ||
            article.author.membershipTier === 'Trial') {
            await this.prisma.user.update({
                where: { id: article.authorId },
                data: {
                    totalViews: { increment: 1 },
                    totalRevenue: article.hasPaywall ? { increment: 0.25 } : undefined,
                },
            });
        }
    }
    formatMembershipResponse(user) {
        return {
            username: user.username,
            tier: user.membershipTier,
            renewalDate: user.membershipRenewalDate,
            autoRenew: user.membershipAutoRenew,
            totalRevenue: user.totalRevenue,
            totalViews: user.membershipTier === 'Free' ? null : user.totalViews,
        };
    }
};
MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipService);
exports.MembershipService = MembershipService;
//# sourceMappingURL=membership.service.js.map