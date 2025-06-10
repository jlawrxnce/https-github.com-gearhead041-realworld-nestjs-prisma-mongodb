"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToMembershipDto = exports.MembershipTier = void 0;
var MembershipTier;
(function (MembershipTier) {
    MembershipTier["Free"] = "Free";
    MembershipTier["Silver"] = "Silver";
    MembershipTier["Gold"] = "Gold";
})(MembershipTier = exports.MembershipTier || (exports.MembershipTier = {}));
function castToMembershipDto(membership, username) {
    return {
        username,
        tier: membership.tier,
        renewalDate: membership.renewalDate,
        totalRevenue: membership.totalRevenue,
        autoRenew: membership.autoRenew,
    };
}
exports.castToMembershipDto = castToMembershipDto;
//# sourceMappingURL=membership.dto.js.map