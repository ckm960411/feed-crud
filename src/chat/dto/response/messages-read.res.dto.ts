import { ApiProperty } from '@nestjs/swagger';

export class MessagesReadResDto {
  @ApiProperty({
    description: '바로팟 채팅방 ID',
    example: 1,
  })
  baropotChatRoomId: number;

  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '읽음 처리 시간',
    example: '2024-01-01T12:00:00.000Z',
  })
  timestamp: Date;
}
