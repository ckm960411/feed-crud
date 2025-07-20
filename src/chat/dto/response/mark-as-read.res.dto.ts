import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadResDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '에러 메시지 (실패 시)',
    example: '읽음 처리에 실패했습니다.',
  })
  message?: string;
}
