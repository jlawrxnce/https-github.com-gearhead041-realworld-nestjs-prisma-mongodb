"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetToken = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
exports.GetToken = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const jwtService = new jwt_1.JwtService({ secret: process.env.SECRET });
    return jwtService.sign({ sub: user.id, email: user.email });
});
//# sourceMappingURL=get-token.decorator.js.map