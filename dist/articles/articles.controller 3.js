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
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const decorator_1 = require("../common/decorator");
const guard_1 = require("../common/guard");
const articles_service_1 = require("./articles.service");
let ArticlesController = class ArticlesController {
    constructor(articleService) {
        this.articleService = articleService;
    }
    async togglePaywall(user, slug) {
        return {
            article: await this.articleService.togglePaywall(user, slug),
        };
    }
    async getAllArticles(user, tag, author, favorited, limit = 10, offset = 0) {
        const articles = await this.articleService.findArticles(user, tag, author, favorited, limit, offset);
        return {
            articles: articles,
            articlesCount: articles.length,
        };
    }
    async getUserFeed(user, limit = 10, offset = 0) {
        const articles = await this.articleService.getUserFeed(user, limit, offset);
        return {
            articles: articles,
            articlesCount: articles.length,
        };
    }
    async getArticle(user, slug) {
        return { article: await this.articleService.findArticle(user, slug) };
    }
    async createArticle(user, dto) {
        return {
            article: await this.articleService.createArticle(user, dto),
        };
    }
    async updateArticle(user, slug, dto) {
        return {
            article: await this.articleService.updateArticle(user, slug, dto.article),
        };
    }
    deleteArticle(slug) {
        return this.articleService.deleteArticle(slug);
    }
    async addCommentToArticle(user, slug, dto) {
        return {
            comment: await this.articleService.addCommentToArticle(user, slug, dto.comment),
        };
    }
    async getCommentsForArticle(slug) {
        return { comments: await this.articleService.getCommentsForArticle(slug) };
    }
    deleteComment(slug, id) {
        return this.articleService.deleteCommentForArticle(slug, id);
    }
    async favoriteArticle(user, slug) {
        return { article: await this.articleService.favouriteArticle(user, slug) };
    }
    async unfavoriteArticle(user, slug) {
        return {
            article: await this.articleService.unfavouriteArticle(user, slug),
        };
    }
};
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Put)(':slug/paywall'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "togglePaywall", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, decorator_1.AllowAny)(),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('tag')),
    __param(2, (0, common_1.Query)('author')),
    __param(3, (0, common_1.Query)('favorited')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getAllArticles", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('feed'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getUserFeed", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, common_1.UseGuards)(guard_1.JwtGuard, guard_1.PaywallGuard),
    (0, decorator_1.AllowAny)(),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getArticle", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)(),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('article')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "createArticle", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Put)(':slug'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "updateArticle", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Delete)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "deleteArticle", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard, guard_1.PaywallGuard),
    (0, common_1.Post)(':slug/comments'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "addCommentToArticle", null);
__decorate([
    (0, common_1.Get)(':slug/comments'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getCommentsForArticle", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Delete)(':slug/comments/:id'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard, guard_1.PaywallGuard),
    (0, common_1.Post)(':slug/favorite'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "favoriteArticle", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard, guard_1.PaywallGuard),
    (0, common_1.Delete)(':slug/favorite'),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "unfavoriteArticle", null);
ArticlesController = __decorate([
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
exports.ArticlesController = ArticlesController;
//# sourceMappingURL=articles.controller.js.map