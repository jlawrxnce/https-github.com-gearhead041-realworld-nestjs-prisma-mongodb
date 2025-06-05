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
exports.PaywallGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const membership_service_1 = require("../../membership/membership.service");
let PaywallGuard = class PaywallGuard {
    constructor(prisma, membershipService) {
        this.prisma = prisma;
        this.membershipService = membershipService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const slug = request.params.slug;
        const user = request.user;
        const article = await this.prisma.article.findUnique({
            where: { slug },
        });
        if (!article) {
            return true;
        }
        if (!article.hasPaywall) {
            return true;
        }
        if (!user) {
            throw new common_1.ForbiddenException('This content requires Gold membership');
        }
        const isGoldMember = await this.membershipService.checkGoldMembership(user.id);
        if (!isGoldMember) {
            throw new common_1.ForbiddenException('This content requires Gold membership');
        }
        return true;
    }
};
PaywallGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        membership_service_1.MembershipService])
], PaywallGuard);
exports.PaywallGuard = PaywallGuard;
//# sourceMappingURL=paywall.guard.js.map