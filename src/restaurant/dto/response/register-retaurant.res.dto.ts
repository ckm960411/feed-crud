import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';

export class RegisterRestaurantResDto {
  @ApiProperty({
    description: '맛집 이름',
    example: '킹경문 순대곱창',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '맛집 생성 시간',
    example: '2025-06-12T05:00:04.895Z',
  })
  @IsString()
  createdAt: Date;

  @ApiProperty({
    description: '맛집 수정 시간',
    example: '2025-06-12T05:00:04.895Z',
  })
  @IsString()
  updatedAt: Date;

  @ApiProperty({
    description: '맛집 카테고리',
    example: 'KOREAN',
    enum: RestaurantCategory,
  })
  @IsEnum(RestaurantCategory)
  category: RestaurantCategory;

  @ApiProperty({
    description: '맛집 주소',
    example: '종로3가 언저리',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: '맛집 위도',
    example: 36.7777,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: '맛집 경도',
    example: 128.12312,
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    description: '맛집 설명',
    example:
      '이경문 순대곱창은 서울특별시 종로구 종로3길 17에 위치한 맛집입니다.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '맛집 전화번호',
    example: '0212341234',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: '맛집 오픈 시간',
    example: '11:00',
  })
  @IsString()
  openingTime: string;

  @ApiProperty({
    description: '맛집 영업 종료 시간',
    example: '22:00',
  })
  @IsString()
  closingTime: string;

  @ApiProperty({
    description: '맛집 마지막 주문 시간',
    example: '21:00',
  })
  @IsString()
  lastOrderTime: string;
}
