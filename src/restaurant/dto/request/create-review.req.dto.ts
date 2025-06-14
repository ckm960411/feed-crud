import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateRestaurantReviewReqDto {
  @ApiProperty({
    description: '평점',
    example: 5,
  })
  @IsNumber()
  @Column()
  rating: number;

  @ApiProperty({
    description: '리뷰 내용',
    example: '맛있어요!',
  })
  @IsString()
  @Column()
  content: string;

  @ApiProperty({
    description: '리뷰 사진 목록',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  photos: string[];
}
