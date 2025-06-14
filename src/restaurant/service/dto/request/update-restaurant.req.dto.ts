import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';

export class UpdateRestaurantReqDto {
  @ApiProperty({
    description: '맛집 이름',
    example: '이경문 순대곱창',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '맛집 카테고리',
    example: 'KOREAN',
    enum: RestaurantCategory,
    required: false,
  })
  @IsEnum(RestaurantCategory)
  @IsOptional()
  category?: RestaurantCategory;

  @ApiProperty({
    description: '맛집 주소',
    example: '서울특별시 종로구 종로3길 17',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '맛집 위도',
    example: 37.565221,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({
    description: '맛집 경도',
    example: 126.978144,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({
    description: '맛집 설명',
    example:
      '이경문 순대곱창은 서울특별시 종로구 종로3길 17에 위치한 맛집입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '맛집 전화번호',
    example: '0212345678 (하이픈 없이 저장)',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: '맛집 오픈 시간',
    example: '11:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  openingTime?: string;

  @ApiProperty({
    description: '맛집 영업 종료 시간',
    example: '22:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  closingTime?: string;

  @ApiProperty({
    description: '맛집 라스트오더 시간',
    example: '21:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastOrderTime?: string;

  @ApiProperty({
    description: '맛집 태그',
    example: ['순대곱창', '노포', '술맛집'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: '맛집 사진',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
