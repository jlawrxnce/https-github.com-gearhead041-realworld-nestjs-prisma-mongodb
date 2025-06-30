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
const client_1 = require("@prisma/client");
let MembershipService = class MembershipService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async activateMembership(user, dto) {
        if (dto.tier === client_1.MembershipTier.Free) {
            throw new common_1.UnprocessableEntityException('Cannot activate Free tier');
        }
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                membershipTier: dto.tier,
                membershipRenewalDate: renewalDate,
            },
        });
        return {
            username: updatedUser.username,
            tier: updatedUser.membershipTier,
            renewalDate: updatedUser.membershipRenewalDate,
            autoRenew: updatedUser.membershipAutoRenew,
            totalRevenue: updatedUser.totalRevenue,
        };
    }
    async updateMembership(user, dto) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (currentUser.membershipTier === client_1.MembershipTier.Free) {
            throw new common_1.ForbiddenException('Free tier users cannot update membership');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                membershipTier: dto.tier,
                membershipAutoRenew: dto.autoRenew,
            },
        });
        return {
            username: updatedUser.username,
            tier: updatedUser.membershipTier,
            renewalDate: updatedUser.membershipRenewalDate,
            autoRenew: updatedUser.membershipAutoRenew,
            totalRevenue: updatedUser.totalRevenue,
        };
    }
    async getMembership(user) {
        const userWithMembership = await this.prisma.user.findUnique({
            where: { id: user.id },
        });
        return {
            username: userWithMembership.username,
            tier: userWithMembership.membershipTier,
            renewalDate: userWithMembership.membershipRenewalDate,
            autoRenew: userWithMembership.membershipAutoRenew,
            totalRevenue: userWithMembership.totalRevenue,
        };
    }
};
MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipService);
exports.MembershipService = MembershipService;
//# sourceMappingURL=membership.service.js.map