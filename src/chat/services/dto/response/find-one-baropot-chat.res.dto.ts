import { ApiProperty } from '@nestjs/swagger';
import { map, pick } from 'lodash';
import { BaropotChatRoom } from 'src/entities/baropot-chat-room.entity';

export class FindOneBaropotChatResDto {
  @ApiProperty({
    description: '바로팟 채팅방 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '채팅방 생성일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '바로팟 채팅방 이름',
    example: '킹경문 채팅방',
  })
  name: string;

  @ApiProperty({
    description: '읽지 않은 메시지 수',
    example: 6,
  })
  unreadCount: number;

  @ApiProperty({
    description: '바로팟 정보',
    example: {
      id: 1,
      title: '킹경문 채팅방',
      maxParticipants: 10,
      date: '2025-01-01',
      time: '12:00',
    },
  })
  baropot: {
    id: number;
    title: string;
    maxParticipants: number;
    date: string;
    time: string;
  };

  @ApiProperty({
    description: '바로팟 참가자 목록',
  })
  participants: {
    isHost: boolean;
    userId: number;
    userName: string;
  }[];

  constructor(baropotChatRoom: BaropotChatRoom, unreadCount: number) {
    this.id = baropotChatRoom.id;
    this.createdAt = baropotChatRoom.createdAt;
    this.name = baropotChatRoom.name;
    this.unreadCount = unreadCount;
    this.baropot = pick(baropotChatRoom.baropot, [
      'id',
      'title',
      'maxParticipants',
      'date',
      'time',
    ]);
    this.participants = map(
      baropotChatRoom.baropot.baropotParticipants,
      (participant) => ({
        isHost: participant.isHost,
        userId: participant.user.id,
        userName: participant.user.name,
      }),
    );
  }
}
