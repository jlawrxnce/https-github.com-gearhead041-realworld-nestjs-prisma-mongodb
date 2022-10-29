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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TagsService = class TagsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTags() {
        const tags = await this.prisma.article.findMany({
            select: {
                tagList: true,
            },
        });
        const flatTags = tags
            .map((tagList) => tagList.tagList)
            .reduce((a, b) => a.concat(b));
        const returnTags = [];
        flatTags.forEach((tag) => {
            if (!((returnTags === null || returnTags === void 0 ? void 0 : returnTags.includes(tag)) || false))
                returnTags.push(tag);
        });
        return returnTags;
    }
};
TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagsService);
exports.TagsService = TagsService;
//# sourceMappingURL=tags.service.js.map