"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToProfile = void 0;
function castToProfile(user, isFollowing) {
    return {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: isFollowing,
    };
}
exports.castToProfile = castToProfile;
//# sourceMappingURL=profile.dto.js.map