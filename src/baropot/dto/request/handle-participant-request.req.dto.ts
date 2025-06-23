import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';

export class HandleParticipantRequestReqDto {
  @ApiProperty({
    description: '참가자 User ID',
    example: 1,
    type: Number,
  })
  @IsNumber()
  participantUserId: number;

  @ApiProperty({
    description: '변경할 참가 상태 (승인 APPROVED 또는 거절 REJECTED)',
    enum: [BaropotJoinedStatus.APPROVED, BaropotJoinedStatus.REJECTED],
    example: 'APPROVED',
  })
  @IsEnum([BaropotJoinedStatus.APPROVED, BaropotJoinedStatus.REJECTED])
  joinedStatus: BaropotJoinedStatus.APPROVED | BaropotJoinedStatus.REJECTED;

  @ApiProperty({
    description: '거절 시 거절 사유 (선택사항)',
    example: '인원이 초과되었습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  hostMemo?: string;
}
