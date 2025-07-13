import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBaropotChatReqDto {
  @ApiProperty({
    description: '바로팟 ID',
    example: 1,
  })
  @IsNumber()
  baropotId: number;

  @ApiProperty({
    description: '채팅방 이름',
    example: '킹경문 레이드',
  })
  @IsString()
  name: string;
}
