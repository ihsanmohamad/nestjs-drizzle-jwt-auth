import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Define your JWT payload interface
export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: number;
}

// Extend the Request interface to include the JWT payload property
export interface JwtRequest extends Request {
  user: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: JwtRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
