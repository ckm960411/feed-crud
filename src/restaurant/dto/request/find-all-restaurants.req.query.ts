import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';

export class FindAllRestaurantsReqQuery {
  @ApiProperty({
    description: '검색어',
    example: '이경문',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '카테고리',
    example: 'KOREAN',
  })
  @IsEnum(RestaurantCategory)
  @IsOptional()
  category?: RestaurantCategory;

  @ApiProperty({
    description: '주소',
    example: '종로3길 17',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '사용자 위도',
    example: 37.565221,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({
    description: '사용자 경도',
    example: 126.978144,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({
    description: '검색 반경 (km)',
    example: 10,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius?: number = 10;
}
