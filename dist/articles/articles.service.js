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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const runtime_1 = require("@prisma/client/runtime");
const prisma_service_1 = require("../prisma/prisma.service");
const membership_service_1 = require("../membership/membership.service");
const dto_1 = require("../membership/dto");
const dto_2 = require("../profiles/dto");
const dto_3 = require("./dto");
let ArticlesService = class ArticlesService {
    constructor(prisma, membershipService) {
        this.prisma = prisma;
        this.membershipService = membershipService;
    }
    async findArticles(user, tag, author, favorited, limit = 10, offset = 0) {
        let articles = await this.prisma.article.findMany({
            where: {
                author: {
                    username: author,
                },
            },
            take: limit,
            skip: offset,
            include: {
                author: true,
                favouritedUsers: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        if (tag)
            articles = articles.filter((article) => article.tagList.some((db) => db === tag));
        if (favorited) {
            const favouritedUser = await this.prisma.user.findUnique({
                where: {
                    username: favorited,
                },
            });
            if (favouritedUser)
                articles = articles.filter((article) => article.favouritedUserIds.includes(favouritedUser.id));
            else
                throw new common_1.NotFoundException(`user ${favorited} not found`);
        }
        if (author) {
            articles = articles.filter((article) => article.author.username === author);
        }
        const articlesDto = articles.map((article) => {
            var _a;
            const following = ((_a = article.author) === null || _a === void 0 ? void 0 : _a.followersIds.includes((user === null || user === void 0 ? void 0 : user.id) || '')) || false;
            let authorProfile;
            if (!article.author)
                authorProfile = null;
            else
                authorProfile = (0, dto_2.castToProfile)(article.author, following);
            return (0, dto_3.castToArticle)(article, user, article.tagList, authorProfile);
        });
        return articlesDto;
    }
    async findArticle(user, slug) {
        var _a, _b;
        const article = await this.prisma.article.findUnique({
            where: {
                slug: slug,
            },
            include: {
                author: true,
            },
        });
        if (article === null)
            throw new common_1.NotFoundException('article not found');
        const following = ((_b = (_a = article.author) === null || _a === void 0 ? void 0 : _a.followersIds) === null || _b === void 0 ? void 0 : _b.includes(user === null || user === void 0 ? void 0 : user.id)) || false;
        const authorProfile = (0, dto_2.castToProfile)(article.author, following);
        return (0, dto_3.castToArticle)(article, user, article.tagList, authorProfile);
    }
    async getUserFeed(user, limit, offset) {
        let articles = await this.prisma.article.findMany({
            include: {
                author: true,
            },
            take: limit,
            skip: offset,
            orderBy: {
                updatedAt: 'desc',
            },
        });
        articles = articles.filter((article) => {
            if (!article.author)
                return false;
            return article.author.followersIds.includes(user.id) || false;
        });
        const articlesDto = articles.map((article) => {
            const authorProfile = (0, dto_2.castToProfile)(article.author, true);
            return (0, dto_3.castToArticle)(article, user, article.tagList, authorProfile);
        });
        return articlesDto;
    }
    async createArticle(user, articletoCreate) {
        const slug = articletoCreate.title.split(' ').join('-');
        try {
            const article = await this.prisma.article.create({
                data: Object.assign(Object.assign({}, articletoCreate), { authorId: user.id, slug: slug, favouritedUserIds: user.id, tagList: {
                        set: articletoCreate.tagList,
                    } }),
            });
            return (0, dto_3.castToArticle)(article, user, article.tagList, (0, dto_2.castToProfile)(user, false));
        }
        catch (error) {
            if (error instanceof runtime_1.PrismaClientValidationError) {
                throw new common_1.BadRequestException('bad request');
            }
        }
    }
    async updateArticle(user, slug, dto) {
        try {
            const article = await this.prisma.article.update({
                where: {
                    slug: slug,
                },
                data: Object.assign(Object.assign({}, dto), { slug: slug }),
                include: {
                    author: true,
                },
            });
            return (0, dto_3.castToArticle)(article, user, article.tagList, (0, dto_2.castToProfile)(article.author, false));
        }
        catch (error) {
            if (error instanceof runtime_1.PrismaClientKnownRequestError)
                if (error.code === 'P2025')
                    throw new common_1.NotFoundException('article not found');
        }
    }
    async deleteArticle(slug) {
        const article = await this.prisma.article.findUnique({
            where: { slug: slug },
        });
        if (!article)
            throw new common_1.NotFoundException('article not found');
        await this.prisma.article.delete({
            where: {
                slug: slug,
            },
        });
        return;
    }
    async addCommentToArticle(user, slug, dto) {
        const article = await this.prisma.article.findUnique({
            where: {
                slug: slug,
            },
        });
        if (!article)
            throw new common_1.NotFoundException('article not found');
        const comment = await this.prisma.comment.create({
            data: {
                articleId: article.id,
                body: dto.body,
                authorId: user.id,
            },
        });
        return (0, dto_3.castToCommentDto)(comment, (0, dto_2.castToProfile)(user, false));
    }
    async getCommentsForArticle(slug) {
        const article = await this.prisma.article.findUnique({
            where: {
                slug: slug,
            },
            select: {
                comments: {
                    include: {
                        author: true,
                    },
                },
            },
        });
        if (article === null)
            throw new common_1.NotFoundException('article not found');
        return article.comments.map((comment) => {
            return (0, dto_3.castToCommentDto)(comment, (0, dto_2.castToProfile)(comment.author, false));
        });
    }
    async deleteCommentForArticle(slug, id) {
        try {
            await this.prisma.article.update({
                where: {
                    slug: slug,
                },
                data: {
                    comments: {
                        delete: {
                            id: id,
                        },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof runtime_1.PrismaClientKnownRequestError)
                if (error.code === 'P2002')
                    throw new common_1.NotFoundException('article not found');
        }
    }
    async favouriteArticle(user, slug) {
        var _a;
        let article = await this.prisma.article.findUnique({
            where: { slug: slug },
            include: {
                author: true,
            },
        });
        if (!article)
            throw new common_1.NotFoundException('article not found');
        if (!article.favouritedUserIds.includes(user.id)) {
            article = await this.prisma.article.update({
                where: {
                    slug: slug,
                },
                data: {
                    favouritedUserIds: {
                        push: user.id,
                    },
                },
                include: {
                    author: true,
                },
            });
        }
        const following = ((_a = article.author) === null || _a === void 0 ? void 0 : _a.followersIds.includes(user.id)) || false;
        return (0, dto_3.castToArticle)(article, user, article.tagList, (0, dto_2.castToProfile)(user, following));
    }
    async unfavouriteArticle(user, slug) {
        var _a;
        const article = await this.prisma.article.findUnique({
            where: { slug: slug },
        });
        if (!article)
            throw new common_1.NotFoundException('article not found');
        article.favouritedUserIds = article.favouritedUserIds.filter((id) => id !== user.id);
        delete article.id;
        const articleUpdated = await this.prisma.article.update({
            where: { slug: slug },
            data: article,
            include: { author: true },
        });
        const isfollowing = ((_a = articleUpdated.author) === null || _a === void 0 ? void 0 : _a.followersIds.includes(user.id)) || false;
        return (0, dto_3.castToArticle)(article, user, article.tagList, (0, dto_2.castToProfile)(articleUpdated.author, isfollowing));
    }
    async togglePaywall(user, slug) {
        const article = await this.prisma.article.findUnique({
            where: { slug },
            include: { author: true },
        });
        if (!article)
            throw new common_1.NotFoundException('article not found');
        if (article.authorId !== user.id) {
            throw new common_1.ForbiddenException('cannot modify others articles');
        }
        const membership = await this.membershipService.getMembership(user);
        if (!membership || membership.tier === 'Free') {
            throw new common_1.ForbiddenException('Only Silver or Gold members can create paywalls');
        }
        const updatedArticle = await this.prisma.article.update({
            where: { slug },
            data: {
                hasPaywall: !article.hasPaywall,
            },
            include: {
                author: {
                    include: {
                        followers: true,
                    },
                },
            },
        });
        const following = user
            ? updatedArticle.author.followers.some((follower) => follower.id === user.id)
            : false;
        return (0, dto_3.castToArticle)(updatedArticle, user, updatedArticle.tagList, (0, dto_2.castToProfile)(updatedArticle.author, following));
    }
    async viewArticle(user, slug) {
        var _a, _b;
        const article = await this.prisma.article.findUnique({
            where: { slug },
            include: {
                author: {
                    include: {
                        membership: true
                    }
                },
            },
        });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        if (article.authorId === user.id) {
            const author = await this.prisma.user.findUnique({
                where: { id: article.authorId },
            });
            const following = ((_a = author === null || author === void 0 ? void 0 : author.followersIds) === null || _a === void 0 ? void 0 : _a.includes(user.id)) || false;
            return (0, dto_3.castToArticle)(article, user, article.tagList, (0, dto_2.castToProfile)(author, following));
        }
        const author = await this.prisma.user.findUnique({
            where: { id: article.authorId },
            include: {
                membership: true
            }
        });
        if (author === null || author === void 0 ? void 0 : author.membership) {
            const revenue = author.membership.tier === dto_1.MembershipTier.Gold.toString()
                ? 0.25
                : author.membership.tier === dto_1.MembershipTier.Silver.toString()
                    ? 0.10
                    : 0;
            if (revenue > 0) {
                await this.membershipService.addRevenue(article.authorId, revenue);
            }
        }
        const updatedArticle = await this.prisma.article.update({
            where: { slug },
            data: {
                viewCount: { increment: 1 },
            },
            include: {
                author: true,
            },
        });
        const following = ((_b = author === null || author === void 0 ? void 0 : author.followersIds) === null || _b === void 0 ? void 0 : _b.includes(user.id)) || false;
        const authorProfile = (0, dto_2.castToProfile)(author, following);
        return (0, dto_3.castToArticle)(updatedArticle, user, updatedArticle.tagList, authorProfile);
    }
};
ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        membership_service_1.MembershipService])
], ArticlesService);
exports.ArticlesService = ArticlesService;
//# sourceMappingURL=articles.service.js.map