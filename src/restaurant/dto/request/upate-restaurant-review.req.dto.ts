import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantReviewReqDto {
  @ApiProperty({
    description: '리뷰 내용',
    example: '맛있어요!',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: '리뷰 평점',
    example: 5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: '리뷰 사진',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  photos?: string[];
}
