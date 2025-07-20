import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class JoinRoomReqDto {
  @ApiProperty({
    description: '바로팟 채팅방 ID',
    example: 1,
  })
  @IsNumber()
  baropotChatRoomId: number;
}
