import { ApiProperty } from '@nestjs/swagger';

export class SendMessageResDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '생성된 메시지 ID',
    example: '507f1f77bcf86cd799439011',
  })
  messageId?: string;

  @ApiProperty({
    description: '에러 메시지 (실패 시)',
    example: '메시지 전송에 실패했습니다.',
  })
  message?: string;
}
