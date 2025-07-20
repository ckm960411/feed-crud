import { CanActivate, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean> {
    try {
      this.logger.log('🔐 WsJwtAuthGuard 실행됨!');

      const client: Socket = context.switchToWs().getClient();

      this.logger.log('=== 웹소켓 인증 시작 ===');
      this.logger.log(`클라이언트 ID: ${client.id}`);
      this.logger.log(`연결 URL: ${client.handshake.url}`);
      this.logger.log(
        `Headers: ${JSON.stringify(client.handshake.headers, null, 2)}`,
      );
      this.logger.log(
        `Auth: ${JSON.stringify(client.handshake.auth, null, 2)}`,
      );

      const token =
        (client.handshake.headers.token as string) ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      this.logger.log(
        `추출된 토큰: ${token ? token.substring(0, 20) + '...' : '없음'}`,
      );

      if (!token) {
        this.logger.error('인증 토큰이 없습니다.');
        throw new WsException('인증 토큰이 없습니다.');
      }

      this.logger.log('JWT 토큰 검증 시작...');
      const payload = this.jwtService.verify(token);
      this.logger.log(`JWT 페이로드: ${JSON.stringify(payload, null, 2)}`);

      const userId = payload.sub;
      this.logger.log(`사용자 ID: ${userId}`);

      // 클라이언트에 사용자 정보 저장
      client.handshake.auth.userId = userId;
      this.logger.log('=== 웹소켓 인증 성공 ===');

      return true;
    } catch (err) {
      this.logger.error('=== 웹소켓 인증 실패 ===');
      this.logger.error(`에러 타입: ${err.constructor.name}`);
      this.logger.error(`에러 메시지: ${err.message}`);
      this.logger.error(`에러 스택: ${err.stack}`);
      throw new WsException('인증에 실패했습니다.');
    }
  }
}
