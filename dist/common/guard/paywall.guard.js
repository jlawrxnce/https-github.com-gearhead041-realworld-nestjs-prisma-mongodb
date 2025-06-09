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
const client_1 = require("@prisma/client");
let PaywallGuard = class PaywallGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
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
            throw new common_1.ForbiddenException('Paywalled content requires authentication');
        }
        const userWithMembership = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { membershipTier: true },
        });
        if ((userWithMembership === null || userWithMembership === void 0 ? void 0 : userWithMembership.membershipTier) === client_1.MembershipTier.Free) {
            throw new common_1.ForbiddenException('This content requires a Gold membership');
        }
        return true;
    }
};
PaywallGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaywallGuard);
exports.PaywallGuard = PaywallGuard;
//# sourceMappingURL=paywall.guard.js.map