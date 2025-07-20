import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtAuthGuard } from '../../auth/guards/ws-jwt-auth.guard';
import { BaropotChatService } from '../services/baropot-chat.service';
import { some } from 'lodash';

export enum BAROPOT_CHAT_EVENTS {
  /** 채팅방 입장 */
  JOIN_ROOM = 'JOIN_ROOM',
  /** 채팅방 나가기 */
  LEAVE_ROOM = 'LEAVE_ROOM',
  /** 메시지 전송 */
  SEND_MESSAGE = 'SEND_MESSAGE',
  /** 새 메시지 수신 */
  NEW_MESSAGE = 'NEW_MESSAGE',
  /** 메시지 읽음 처리 */
  MARK_AS_READ = 'MARK_AS_READ',
  /** 메시지 읽음 처리 완료 */
  MESSAGES_READ = 'MESSAGES_READ',
  /** 타이핑 중임을 알림 */
  TYPING = 'TYPING',
  /** 타이핑 중임을 알림 */
  USER_TYPING = 'USER_TYPING',
}

// 바로팟 채팅 웹소켓 게이트웨이 설정
// namespace: /baropot-chat, CORS 허용
@WebSocketGateway({
  namespace: '/baropot-chat', // 슬래시 추가
  cors: {
    origin: '*', // TODO: 프론트엔드 주소로 변경
    credentials: true,
  },
  transports: ['websocket'], // 명시적으로 전송 방식 지정
})
// 웹소켓 연결 시 JWT 인증 가드 적용
@UseGuards(WsJwtAuthGuard)
export class BaropotChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // 실제 소켓 서버 인스턴스
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BaropotChatGateway.name);

  // 현재 연결된 사용자 목록 (userId → socket)
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly baropotChatService: BaropotChatService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('=== BaropotChatGateway 초기화 완료 ===');
  }

  // 클라이언트가 소켓 연결을 맺을 때 실행됨
  async handleConnection(client: Socket) {
    this.logger.log('=== 웹소켓 연결 시도 감지됨 ===');

    try {
      // handleConnection에서는 가드가 실행되지 않으므로 직접 토큰 검증
      const token =
        client.handshake.auth.token ||
        client.handshake.query.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '') ||
        client.handshake.headers.token;

      if (!token) {
        this.logger.error('인증 토큰이 없습니다.');
        client.disconnect();
        return;
      }

      // JWT 검증
      const { id: userId } = this.jwtService.verify(token);

      // 클라이언트에 사용자 정보 저장
      client.handshake.auth.userId = userId;

      this.connectedUsers.set(userId, client);
      this.logger.log(`(User ID: ${userId}) 사용자가 연결되었습니다.`);
      this.logger.log(`현재 연결된 사용자 수: ${this.connectedUsers.size}`);
    } catch (error) {
      this.logger.error('연결 처리 중 에러 발생:', error);
      client.disconnect();
    }
  }

  // 클라이언트가 소켓 연결을 끊을 때 실행됨
  async handleDisconnect(client: Socket) {
    this.logger.log('=== 웹소켓 연결 해제 ===');

    try {
      const userId = client.handshake.auth.userId;
      this.connectedUsers.delete(userId);
      this.logger.log(`(User ID: ${userId}) 사용자가 연결이 끊어졌습니다.`);
      this.logger.log(`현재 연결된 사용자 수: ${this.connectedUsers.size}`);
    } catch (error) {
      this.logger.error('연결 해제 처리 중 에러 발생:', error);
    }
  }

  // 클라이언트가 채팅방에 입장할 때 호출
  // data: { baropotChatRoomId }
  // 성공 시 해당 소켓을 room_{baropotChatRoomId}에 join
  @SubscribeMessage(BAROPOT_CHAT_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { baropotChatRoomId: number },
  ) {
    const userId = client.handshake.auth.userId;
    const { baropotChatRoomId } = data;

    try {
      // 채팅방 참여 권한 확인 (DB 조회)
      const chatRoom = await this.baropotChatService.findChatRoom(
        baropotChatRoomId,
        userId,
      );

      if (
        !some(
          chatRoom.participants,
          (participant) => participant.userId === userId,
        )
      ) {
        throw new BadRequestException('채팅방에 참여할 권한이 없습니다.');
      }

      // 소켓.io의 룸 기능을 이용해 해당 채팅방에 입장
      client.join(`room_${baropotChatRoomId}`);
      this.logger.log(
        `(User ID: ${userId}) 사용자가 채팅방에 입장했습니다. (Room ID: ${baropotChatRoomId})`,
      );
      return { success: true, message: '채팅방에 입장했습니다.' };
    } catch (error) {
      // 권한 없거나 에러 발생 시 실패 메시지 반환
      return { success: false, message: error.message };
    }
  }

  // 클라이언트가 채팅방에서 나갈 때 호출
  // data: { baropotChatRoomId }
  @SubscribeMessage(BAROPOT_CHAT_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { baropotChatRoomId: number },
  ) {
    const userId = client.handshake.auth.userId;
    const { baropotChatRoomId } = data;
    // 소켓을 해당 채팅방 룸에서 제거
    client.leave(`room_${baropotChatRoomId}`);
    this.logger.log(
      `(User ID: ${userId}) 사용자가 채팅방에서 나갔습니다. (Room ID: ${baropotChatRoomId})`,
    );
    return { success: true, message: '채팅방을 나갔습니다.' };
  }

  // 클라이언트가 메시지를 보낼 때 호출
  // data: { baropotChatRoomId, content }
  @SubscribeMessage(BAROPOT_CHAT_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { baropotChatRoomId: number; content: string },
  ) {
    const userId = client.handshake.auth.userId;
    const { baropotChatRoomId, content } = data;

    try {
      // 메시지 저장 (MongoDB)
      const message = await this.baropotChatService.sendMessage(
        baropotChatRoomId,
        userId,
        content,
      );
      // 같은 채팅방에 있는 모든 사용자에게 메시지 전송
      this.server
        .to(`room_${baropotChatRoomId}`)
        .emit(BAROPOT_CHAT_EVENTS.NEW_MESSAGE, {
          messageId: message.messageId,
          baropotChatRoomId: message.baropotChatRoomId,
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          timestamp: message.timestamp,
        });
      return { success: true, messageId: message.messageId };
    } catch (error) {
      // 에러 발생 시 실패 메시지 반환
      return { success: false, message: error.message };
    }
  }

  // 테스트용 메시지 핸들러 (가드 실행 확인용)
  @SubscribeMessage('TEST_AUTH')
  async handleTestAuth(@ConnectedSocket() client: Socket) {
    this.logger.log('🧪 TEST_AUTH 메시지 수신됨');
    this.logger.log(`사용자 ID: ${client.handshake.auth.userId}`);
    return { success: true, userId: client.handshake.auth.userId };
  }

  // 클라이언트가 메시지 읽음 처리를 할 때 호출
  // data: { baropotChatRoomId }
  @SubscribeMessage(BAROPOT_CHAT_EVENTS.MARK_AS_READ)
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { baropotChatRoomId: number },
  ) {
    const userId = client.handshake.auth.userId;
    const { baropotChatRoomId } = data;

    try {
      // 읽음 처리 (MongoDB)
      await this.baropotChatService.markAsRead(baropotChatRoomId, userId);
      // 본인에게 읽음 처리 완료 알림
      client.emit(BAROPOT_CHAT_EVENTS.MESSAGES_READ, {
        baropotChatRoomId,
        userId,
        timestamp: new Date(),
      });
      return { success: true };
    } catch (error) {
      // 에러 발생 시 실패 메시지 반환
      return { success: false, message: error.message };
    }
  }
}
