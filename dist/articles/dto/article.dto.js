"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToArticle = void 0;
function castToArticle(article, user, tags, author) {
    return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: tags,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favouritedUserIds.includes(user === null || user === void 0 ? void 0 : user.id) || false,
        favoritesCount: article.favouritedUserIds.length,
        hasPaywall: article.hasPaywall,
        viewCount: article.viewCount,
        author: author,
    };
}
exports.castToArticle = castToArticle;
//# sourceMappingURL=article.dto.js.map