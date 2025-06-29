import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { DiscountType } from 'src/entities/coupon.entity';

export class CreateCouponReqDto {
  @ApiProperty({
    description: '쿠폰 이름',
    example: '쿠폰 이름',
  })
  name: string;

  @ApiProperty({
    description: '쿠폰 설명',
    example: '쿠폰 설명',
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '쿠폰 만료일',
    example: '2025-01-01',
  })
  expiredAt: Date;

  @ApiProperty({
    description: '쿠폰 할인 타입',
    example: 'PERCENTAGE',
  })
  discountType: DiscountType;

  @ApiProperty({
    description:
      '쿠폰 할인 금액/퍼센티지, 정률 할인의 경우 퍼센티지, 정액 할인의 경우 금액',
    example: 10000,
  })
  amount: number;
}
