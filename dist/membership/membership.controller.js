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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipController = void 0;
const common_1 = require("@nestjs/common");
const membership_service_1 = require("./membership.service");
const guard_1 = require("../common/guard");
const decorator_1 = require("../common/decorator");
let MembershipController = class MembershipController {
    constructor(membershipService) {
        this.membershipService = membershipService;
    }
    async activateMembership(user, dto) {
        const membership = await this.membershipService.activateMembership(user, dto.tier);
        return { membership };
    }
    async updateMembership(user, dto) {
        const membership = await this.membershipService.updateMembership(user, dto);
        return { membership };
    }
    async getMembership(user) {
        const membership = await this.membershipService.getMembership(user);
        return { membership };
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('membership')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "activateMembership", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('membership')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "updateMembership", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    __param(0, (0, decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "getMembership", null);
MembershipController = __decorate([
    (0, common_1.Controller)('membership'),
    __metadata("design:paramtypes", [membership_service_1.MembershipService])
], MembershipController);
exports.MembershipController = MembershipController;
//# sourceMappingURL=membership.controller.js.map