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
exports.ProfilesController = void 0;
const common_1 = require("@nestjs/common");
const get_user_decorator_1 = require("../common/decorator/get-user.decorator");
const guard_1 = require("../common/guard");
const profiles_service_1 = require("./profiles.service");
const decorator_1 = require("../common/decorator");
const guard_2 = require("../articles/guard");
let ProfilesController = class ProfilesController {
    constructor(profileService) {
        this.profileService = profileService;
    }
    async findUser(user, userName) {
        return { profile: await this.profileService.findUser(user, userName) };
    }
    async followUser(user, userName) {
        return { profile: await this.profileService.followUser(user, userName) };
    }
    async unfollowUser(user, username) {
        return { profile: await this.profileService.unfollowUser(user, username) };
    }
};
__decorate([
    (0, common_1.Get)(':username'),
    (0, decorator_1.AllowAny)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "findUser", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)(':username/follow'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)(':username/follow'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "unfollowUser", null);
ProfilesController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard, guard_2.PaywallGuard),
    (0, common_1.Controller)('profiles'),
    __metadata("design:paramtypes", [profiles_service_1.ProfilesService])
], ProfilesController);
exports.ProfilesController = ProfilesController;
//# sourceMappingURL=profiles.controller.js.map