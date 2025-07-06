import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    // 세션에 저장 (필요한 경우)
    const session = request.session;
    if (session) {
      session.userId = request.user;
    }

    return activate;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err;
    }
    return user;
  }
}
