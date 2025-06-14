import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { map } from 'lodash';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';
import { FindReviewResponse } from './find-review.response';

export class FindOneRestaurantResDto {
  @ApiProperty({
    description: '맛집 ID',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '맛집 이름',
    example: '이경문 순대곱창',
  })
  @IsString()
  name: string;

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
    example: '내 2024년 최고 맛집',
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

  @ApiProperty({
    description: '맛집 사진',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  })
  @IsArray()
  photos: string[];

  @ApiProperty({
    description: '맛집 태그',
    example: ['순대곱창', '노포', '술맛집'],
  })
  @IsArray()
  restaurantToRestaurantTags: string[];

  @ApiProperty({
    description: '본인 작성 여부',
    example: true,
  })
  @IsBoolean()
  isWrittenByMe: boolean;

  @ApiProperty({
    description: '리뷰 목록',
    example: [
      {
        id: 1,
        userId: 1,
        userName: '홍길동',
        userEmail: 'hong@example.com',
        rating: 5,
        content: '맛있어요!',
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
        ],
      },
    ],
  })
  @IsArray()
  reviews: FindReviewResponse[];

  @ApiProperty({
    description: '리뷰 개수',
    example: 1,
  })
  @IsNumber()
  reviewCount: number;

  @ApiProperty({
    description: '맛집 찜 여부',
    example: true,
  })
  @IsBoolean()
  isBookmarked: boolean;

  constructor(restaurant: Restaurant, userId?: number) {
    this.id = restaurant.id;
    this.name = restaurant.name;
    this.category = restaurant.category;
    this.address = restaurant.address;
    this.lat = restaurant.lat;
    this.lng = restaurant.lng;
    this.description = restaurant.description;
    this.phoneNumber = restaurant.phoneNumber;
    this.openingTime = restaurant.openingTime;
    this.closingTime = restaurant.closingTime;
    this.lastOrderTime = restaurant.lastOrderTime;
    this.photos = map(restaurant.photos, 'url');
    this.restaurantToRestaurantTags = map(
      restaurant.restaurantToRestaurantTags,
      'restaurantTag.name',
    );
    this.isWrittenByMe = userId === restaurant.user.id;
    this.reviews = map(restaurant.reviews, (review) => {
      return new FindReviewResponse(review);
    });
    this.reviewCount = restaurant.reviews.length;
    this.isBookmarked = restaurant.bookmarks.some(
      (bookmark) => bookmark.user.id === userId,
    );
  }
}
