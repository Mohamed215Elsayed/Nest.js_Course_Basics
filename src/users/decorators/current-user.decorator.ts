import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from "../interfaces/jwt-payload.interface"

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) {
      return null;
    }
    // لو عايز تجيب قيمة معينة بس (مثلاً sub)
    return data ? user[data] : user;
  },
);
