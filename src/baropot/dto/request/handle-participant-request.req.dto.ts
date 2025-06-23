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
    description:
      '변경할 참가 상태 (승인 APPROVED 또는 거절 REJECTED 또는 강퇴 REMOVED)',
    enum: [
      BaropotJoinedStatus.APPROVED,
      BaropotJoinedStatus.REJECTED,
      BaropotJoinedStatus.REMOVED,
    ],
    example: 'APPROVED',
  })
  @IsEnum([
    BaropotJoinedStatus.APPROVED,
    BaropotJoinedStatus.REJECTED,
    BaropotJoinedStatus.REMOVED,
  ])
  joinedStatus:
    | BaropotJoinedStatus.APPROVED
    | BaropotJoinedStatus.REJECTED
    | BaropotJoinedStatus.REMOVED;

  @ApiProperty({
    description: '거절 시 거절 사유 (선택사항)',
    example: '인원이 초과되었습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  hostMemo?: string;
}
