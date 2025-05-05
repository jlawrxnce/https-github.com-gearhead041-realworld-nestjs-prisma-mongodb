import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const GetToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const jwtService = new JwtService({ secret: process.env.SECRET });
    return jwtService.sign({ sub: user.id, email: user.email });
  },
);
