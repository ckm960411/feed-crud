import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ParticipateBaropotReqDto {
  @ApiProperty({
    description: '참가 메시지',
    example: '술을 좋아하는 21살 청춘 빡빡좌입니다^^',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  joinMessage?: string;
}
