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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon = require("argon2");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const runtime_1 = require("@prisma/client/runtime");
let AuthService = class AuthService {
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
    }
    async createUser(dto) {
        const password = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: Object.assign(Object.assign({}, dto), { password: password }),
            });
            const token = await this.signToken(user.id, user.email);
            const userToReturn = {
                email: user.email,
                token: token,
                username: user.username,
                bio: user.bio,
                image: user.image,
            };
            return userToReturn;
        }
        catch (e) {
            if (e instanceof runtime_1.PrismaClientKnownRequestError) {
                if (e.code === 'P2002')
                    throw new common_1.BadRequestException('email is taken');
            }
        }
    }
    async verifyUser(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('user does not exist');
        const matches = await argon.verify(user.password, dto.password);
        if (!matches)
            throw new common_1.UnauthorizedException('password and email do not match');
        const token = await this.signToken(user.id, user.email);
        const userReturned = {
            email: user.email,
            token: token,
            username: user.username,
            bio: user.bio,
            image: user.image,
        };
        return userReturned;
    }
    async signToken(userId, email) {
        const data = {
            sub: userId,
            email: email,
        };
        const SECRET = this.config.get('SECRET');
        const token = await this.jwt.signAsync(data, {
            secret: SECRET,
            expiresIn: '5h',
        });
        return token;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map