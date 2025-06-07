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
    async addRevenue(username, amount) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { membership: true },
        });
        if (!user || !user.membership) {
            throw new common_1.NotFoundException('User membership not found');
        }
        await this.prisma.membership.update({
            where: { userId: user.id },
            data: {
                totalRevenue: { increment: amount },
            },
        });
    }
    async createMembership(user, data) {
        var _a;
        if (data.tier === 'Free') {
            throw new common_1.ForbiddenException('Cannot activate Free tier membership');
        }
        const renewalDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
        const membership = await this.prisma.membership.create({
            data: {
                tier: data.tier,
                autoRenew: (_a = data.autoRenew) !== null && _a !== void 0 ? _a : false,
                renewalDate: renewalDate,
                userId: user.id,
            },
            include: {
                user: true,
            },
        });
        return {
            username: membership.user.username,
            tier: membership.tier,
            renewalDate: membership.renewalDate,
            autoRenew: membership.autoRenew,
            totalRevenue: membership.totalRevenue || 0,
        };
    }
    async updateMembership(user, data) {
        const membership = await this.prisma.membership.findUnique({
            where: { userId: user.id },
            include: { user: true },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('Free tier users cannot update membership');
        }
        if (membership.tier === 'Free') {
            throw new common_1.ForbiddenException('Free tier users cannot update membership');
        }
        const updatedMembership = await this.prisma.membership.update({
            where: { userId: user.id },
            data: {
                tier: data.tier,
                autoRenew: data.autoRenew !== undefined ? data.autoRenew : membership.autoRenew,
            },
            include: { user: true },
        });
        return {
            username: updatedMembership.user.username,
            tier: updatedMembership.tier,
            renewalDate: updatedMembership.renewalDate,
            autoRenew: updatedMembership.autoRenew,
            totalRevenue: updatedMembership.totalRevenue,
        };
    }
    async getMembership(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { membership: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.membership) {
            return {
                username: user.username,
                tier: 'Free',
                renewalDate: new Date(),
                autoRenew: false,
                totalRevenue: 0,
            };
        }
        return {
            username: user.username,
            tier: user.membership.tier,
            renewalDate: user.membership.renewalDate,
            autoRenew: user.membership.autoRenew,
            totalRevenue: user.membership.totalRevenue,
        };
    }
    async hasMembershipAccess(user) {
        if (!user)
            return false;
        const membership = await this.prisma.membership.findUnique({
            where: { userId: user.id },
        });
        return (membership === null || membership === void 0 ? void 0 : membership.tier) === client_1.Tier.Gold || (membership === null || membership === void 0 ? void 0 : membership.tier) === client_1.Tier.Silver;
    }
};
MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipService);
exports.MembershipService = MembershipService;
//# sourceMappingURL=membership.service.js.map