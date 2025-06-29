import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateRestaurantReservationReqDto {
  @ApiProperty({
    description: '예약 날짜',
    example: '2025-01-01',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({
    description: '예약 시간',
    example: '12:00',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):(00|30)$/, {
    message: '예약 시간은 00분 또는 30분 단위로만 입력할 수 있습니다.',
  })
  time: string;

  @ApiProperty({
    description: '참가자 수',
    example: 4,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  participants?: number;

  @ApiProperty({
    description: '예약 설명',
    example: '맛있겠다 빨리 가고싶다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
