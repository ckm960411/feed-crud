import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { values } from 'lodash';
import { ContactMethod } from 'src/types/enum/contact-method.enum';
import { ParticipantAgeGroup } from 'src/types/enum/participant-age-group.enum';
import { ParticipantGender } from 'src/types/enum/participant-gender.enum';
import { PaymentMethod } from 'src/types/enum/payment-method.enum';

export class UpdateBaropotReqDto {
  @ApiProperty({
    description: '바로팟 모임 타이틀',
    example: '킹경문 순대곱창 먹어보자',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '바로팟 모임 장소',
    example: '종로3가 6번출구',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: '바로팟 최대 참가자수',
    example: 4,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({
    description: '바로팟 모임 날짜',
    example: '2025-06-22',
    required: false,
  })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: '바로팟 모임 시간',
    example: '12:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({
    description: '바로팟 참가자 성별',
    example: 'MALE',
    enum: [...values(ParticipantGender)],
    required: false,
  })
  @IsEnum(ParticipantGender)
  @IsOptional()
  participantGender?: ParticipantGender;

  @ApiProperty({
    description: '바로팟 참가자 나이대',
    example: 'THIRTIES',
    enum: [...values(ParticipantAgeGroup)],
    required: false,
  })
  @IsEnum(ParticipantAgeGroup)
  @IsOptional()
  participantAgeGroup?: ParticipantAgeGroup;

  @ApiProperty({
    description: '바로팟 참가자 연락 방법',
    example: 'KAKAO',
    enum: [...values(ContactMethod)],
    required: false,
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
    description: '바로팟 결제 방법',
    example: 'DUTCH_PAY',
    enum: [...values(PaymentMethod)],
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: '바로팟 모임 설명',
    example: '킹경문 안 먹으면 그때까지 인생 손해보는 거임',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

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
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
