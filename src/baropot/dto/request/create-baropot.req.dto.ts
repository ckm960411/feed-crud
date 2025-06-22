import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { values } from 'lodash';
import { ContactMethod } from 'src/types/enum/contact-method.enum';
import { ParticipantAgeGroup } from 'src/types/enum/participant-age-group.enum';
import { ParticipantGender } from 'src/types/enum/participant-gender.enum';
import { PaymentMethod } from 'src/types/enum/payment-method.enum';

export class CreateBaropotReqDto {
  @ApiProperty({
    description: '바로팟 맛집 ID',
    example: 1,
  })
  @IsNumber()
  restaurantId: number;

  @ApiProperty({
    description: '바로팟 모집 타이틀',
    example: '킹경문에서 진또배기 순대곱창전골 먹어보자',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '바로팟 모임 장소',
    example: '종로3가 6번출구',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: '바로팟 최대 참가자수',
    example: 4,
  })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    description: '바로팟 모임 날짜',
    example: '2025-06-22',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({
    description: '바로팟 모임 시간',
    example: '12:00',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  time: string;

  @ApiProperty({
    description: '바로팟 참가자 성별',
    example: 'MALE',
    default: 'ANY',
    required: false,
    enum: [...values(ParticipantGender)],
  })
  @IsEnum(ParticipantGender)
  @IsOptional()
  participantGender?: ParticipantGender;

  @ApiProperty({
    description: '바로팟 참가자 나이대',
    example: 'THIRTIES',
    default: 'ALL',
    required: false,
    enum: [...values(ParticipantAgeGroup)],
  })
  @IsEnum(ParticipantAgeGroup)
  @IsOptional()
  participantAgeGroup?: ParticipantAgeGroup;

  @ApiProperty({
    description: '바로팟 참가자 연락 방법',
    example: 'KAKAO',
    required: false,
    default: null,
    enum: [...values(ContactMethod)],
  })
  @IsEnum(ContactMethod)
  @IsOptional()
  contactMethod?: ContactMethod;

  @ApiProperty({
    description: '바로팟 참가자 인당 예상 비용',
    example: 30000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  estimatedCostPerPerson?: number;

  @ApiProperty({
    description: '바로팟 결제 방법 (default: DUTCH_PAY)',
    example: 'DUTCH_PAY',
    required: false,
    default: 'DUTCH_PAY',
    enum: [...values(PaymentMethod)],
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: '바로팟 모임 설명',
    example: '킹경문 안 먹으면 그때까지 인생 손해보는 거임',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '바로팟 모임 규칙',
    example: '여미새 남미새는 오지마세요~',
    required: false,
  })
  @IsString()
  @IsOptional()
  rule?: string;

  @ApiProperty({
    description: '바로팟 태그',
    example: ['순대곱창', '순대', '곱창'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
