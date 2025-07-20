import { ApiProperty } from '@nestjs/swagger';

export class NewMessageResDto {
  @ApiProperty({
    description: '메시지 ID',
    example: '507f1f77bcf86cd799439011',
  })
  messageId: string;

  @ApiProperty({
    description: '바로팟 채팅방 ID',
    example: 1,
  })
  baropotChatRoomId: number;

  @ApiProperty({
    description: '송신자 ID',
    example: 1,
  })
  senderId: number;

  @ApiProperty({
    description: '송신자 이름',
    example: '홍길동',
  })
  senderName: string;

  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요!',
  })
  content: string;

  @ApiProperty({
    description: '메시지 전송 시간',
    example: '2024-01-01T12:00:00.000Z',
  })
  timestamp: Date;
}
