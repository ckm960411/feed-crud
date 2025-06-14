import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';
import { map } from 'lodash';
import { RestaurantReview } from 'src/entities/restaurant/restaurant-review.entity';

export class FindReviewResponse {
  @ApiProperty({
    description: '리뷰 ID',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '리뷰 작성일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '리뷰 수정일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: '리뷰 평점',
    example: 5,
  })
  @IsNumber()
  rating: number;

  @ApiProperty({
    description: '리뷰 내용',
    example: '맛있어요!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '리뷰 사진 목록',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  })
  @IsArray()
  photos: string[];

  @ApiProperty({
    description: '리뷰 작성 유저 ID',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '리뷰 작성 유저 이름',
    example: '홍길동',
  })
  @IsString()
  userName: string;

  @ApiProperty({
    description: '리뷰 작성 유저 이메일',
    example: 'hong@example.com',
  })
  @IsString()
  userEmail: string;

  constructor(review: RestaurantReview) {
    this.id = review.id;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.rating = review.rating;
    this.content = review.content;
    this.photos = map(review.photos, 'url');
    this.userId = review.user.id;
    this.userName = review.user.name;
    this.userEmail = review.user.email;
  }
}
