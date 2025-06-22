import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';
import { ParticipantAgeGroup } from 'src/types/enum/participant-age-group.enum';
import { ParticipantGender } from 'src/types/enum/participant-gender.enum';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';

export class FindAllBaropotReqQuery {
  @ApiProperty({
    description: '바로팟 상태 리스트',
    example: ['OPEN', 'FULL'],
    required: false,
    default: ['OPEN'],
    enum: BaropotStatus,
  })
  @IsArray()
  @IsEnum(BaropotStatus, { each: true })
  @IsOptional()
  statusList?: BaropotStatus[] = [BaropotStatus.OPEN];

  @ApiProperty({
    description: '바로팟 맛집 타이틀 검색',
    example: '순대곱창',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '바로팟 태그 검색',
    example: '곱창',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: '바로팟 참가자 성별 리스트',
    example: ['MALE', 'FEMALE'],
    required: false,
    enum: ParticipantGender,
  })
  @IsArray()
  @IsEnum(ParticipantGender, { each: true })
  @IsOptional()
  participantGenderList?: ParticipantGender[];

  @ApiProperty({
    description: '바로팟 참가자 나이 그룹 리스트',
    example: ['10', '20'],
    required: false,
    enum: ParticipantAgeGroup,
  })
  @IsArray()
  @IsEnum(ParticipantAgeGroup, { each: true })
  @IsOptional()
  participantAgeGroupList?: ParticipantAgeGroup[];

  @ApiProperty({
    description: '맛집 이름 검색',
    example: '이경문',
    required: false,
  })
  @IsString()
  @IsOptional()
  restaurantName?: string;

  @ApiProperty({
    description: '맛집 카테고리 검색',
    example: 'KOREAN',
    required: false,
    enum: RestaurantCategory,
  })
  @IsEnum(RestaurantCategory)
  @IsOptional()
  restaurantCategory?: RestaurantCategory;

  @ApiProperty({
    description: '주소',
    example: '종로3길 17',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '사용자 위도',
    example: 37.565221,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({
    description: '사용자 경도',
    example: 126.978144,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({
    description: '검색 반경 (km)',
    example: 10,
    default: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius?: number = 10;
}
