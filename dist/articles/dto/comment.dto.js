"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToCommentDto = void 0;
function castToCommentDto(comment, author) {
    return {
        id: comment.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body,
        author: author,
    };
}
exports.castToCommentDto = castToCommentDto;
//# sourceMappingURL=comment.dto.js.map