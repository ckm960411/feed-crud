import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any, info: any) {
    // JWT 검증에 실패하더라도 에러를 던지지 않고
    // user가 없으면 null을 반환
    return user || null;
  }
}
