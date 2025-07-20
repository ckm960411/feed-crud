import { ApiProperty } from '@nestjs/swagger';

export class LeaveRoomResDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '채팅방을 나갔습니다.',
  })
  message: string;
}
