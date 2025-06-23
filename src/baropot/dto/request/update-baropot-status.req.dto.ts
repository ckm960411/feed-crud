import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';

export class UpdateBaropotStatusReqDto {
  @ApiProperty({
    description: '바로팟 상태',
    example: BaropotStatus.IN_PROGRESS,
    enum: [
      BaropotStatus.IN_PROGRESS,
      BaropotStatus.COMPLETED,
      BaropotStatus.CANCELLED,
    ],
  })
  @IsEnum([
    BaropotStatus.IN_PROGRESS,
    BaropotStatus.COMPLETED,
    BaropotStatus.CANCELLED,
  ])
  status:
    | BaropotStatus.IN_PROGRESS
    | BaropotStatus.COMPLETED
    | BaropotStatus.CANCELLED;
}
