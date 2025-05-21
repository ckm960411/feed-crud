import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (data) {
      // 특정 필드만 가져오고 싶을 때 (예: @User('email'))
      return request.user[data];
    }

    return request.user; // 전체 user 객체 반환
  },
);
