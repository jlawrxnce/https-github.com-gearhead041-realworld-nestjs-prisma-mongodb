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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dto_1 = require("./dto");
let ProfilesService = class ProfilesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUser(user, userName) {
        const userFromDb = await this.prisma.user.findUnique({
            where: {
                username: userName,
            },
        });
        if (!userFromDb)
            throw new common_1.NotFoundException('user not found');
        const isFollowing = userFromDb.followersIds.includes(user.id);
        const profile = (0, dto_1.castToProfile)(userFromDb, isFollowing);
        return profile;
    }
    async followUser(user, userName) {
        const userFollowed = await this.prisma.user.update({
            where: {
                username: userName,
            },
            data: {
                followers: {
                    set: [{ username: user.username }],
                },
            },
        });
        const profile = (0, dto_1.castToProfile)(userFollowed, true);
        console.log('profile', profile);
        return profile;
    }
    async unfollowUser(user, username) {
        const userFromDb = await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                followers: {
                    disconnect: [{ id: user.id }],
                },
            },
        });
        const profile = (0, dto_1.castToProfile)(userFromDb, false);
        return profile;
    }
};
ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
exports.ProfilesService = ProfilesService;
//# sourceMappingURL=profiles.service.js.map