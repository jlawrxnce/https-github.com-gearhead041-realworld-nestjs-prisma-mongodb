"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
class JwtGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    handleRequest(err, user, info, context, status) {
        const request = context.switchToHttp().getRequest();
        this.reflector = new core_1.Reflector();
        const allowAny = this.reflector.get('allow-any', context.getHandler());
        if (user)
            return user;
        if (allowAny)
            return true;
        throw new common_1.UnauthorizedException();
    }
}
exports.JwtGuard = JwtGuard;
//# sourceMappingURL=jwt.guard.js.map