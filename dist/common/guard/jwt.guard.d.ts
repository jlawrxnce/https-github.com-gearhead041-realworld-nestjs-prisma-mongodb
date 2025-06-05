import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const JwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtGuard extends JwtGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any): any;
}
export {};
