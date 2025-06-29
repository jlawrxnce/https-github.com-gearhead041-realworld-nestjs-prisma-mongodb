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
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ArticleService = class ArticleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBySlug(slug) {
        return this.prisma.article.findUnique({
            where: { slug },
        });
    }
    async togglePaywall(article) {
        const updatedArticle = await this.prisma.article.update({
            where: { id: article.id },
            data: {
                hasPaywall: !article.hasPaywall,
            },
            include: {
                author: true,
            },
        });
        return {
            article: Object.assign(Object.assign({}, updatedArticle), { favorited: false, favoritesCount: 0, author: {
                    username: updatedArticle.author.username,
                    bio: updatedArticle.author.bio || '',
                    image: updatedArticle.author.image || '',
                    following: false,
                } }),
        };
    }
};
ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArticleService);
exports.ArticleService = ArticleService;
//# sourceMappingURL=article.service.js.map