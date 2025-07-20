import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class SendMessageReqDto {
  @ApiProperty({
    description: '바로팟 채팅방 ID',
    example: 1,
  })
  @IsNumber()
  baropotChatRoomId: number;

  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요!',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  content: string;
}
