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
const dto_1 = require("./dto");
let MembershipService = class MembershipService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async activateMembership(user, tier) {
        if (tier === dto_1.MembershipTier.Free) {
            throw new common_1.UnprocessableEntityException('Cannot activate Free tier membership');
        }
        const membership = await this.prisma.membership.upsert({
            where: {
                userId: user.id,
            },
            update: {
                tier,
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
                userId: user.id,
                tier,
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return (0, dto_1.castToMembershipDto)(membership, user.username);
    }
    async updateMembership(user, dto) {
        const membership = await this.prisma.membership.findUnique({
            where: {
                userId: user.id,
            },
        });
        if (!membership || membership.tier === dto_1.MembershipTier.Free) {
            throw new common_1.ForbiddenException('Only paid members can update membership');
        }
        const updatedMembership = await this.prisma.membership.update({
            where: {
                userId: user.id,
            },
            data: {
                tier: dto.tier,
                autoRenew: dto.autoRenew,
            },
        });
        return (0, dto_1.castToMembershipDto)(updatedMembership, user.username);
    }
    async getMembership(user) {
        const membership = await this.prisma.membership.findUnique({
            where: {
                userId: user.id,
            },
        });
        if (!membership) {
            return {
                username: user.username,
                tier: dto_1.MembershipTier.Free,
                renewalDate: new Date(),
                autoRenew: false,
            };
        }
        return (0, dto_1.castToMembershipDto)(membership, user.username);
    }
    async checkGoldMembership(userId) {
        if (!userId) {
            return false;
        }
        const membership = await this.prisma.membership.findUnique({
            where: {
                userId,
            },
        });
        return (membership === null || membership === void 0 ? void 0 : membership.tier) === dto_1.MembershipTier.Gold;
    }
};
MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembershipService);
exports.MembershipService = MembershipService;
//# sourceMappingURL=membership.service.js.map