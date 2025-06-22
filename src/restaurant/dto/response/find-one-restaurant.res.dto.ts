import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { map, sumBy } from 'lodash';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';
import { FindReviewResponse } from './find-review.response';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';

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

  @ApiProperty({
    description: '바로팟 목록',
    example: [
      {
        id: 1,
        host: {
          userId: 1,
          name: '장혜리',
        },
        participantCount: 3,
        pendingParticipantCount: 5,
        participants: [
          {
            userId: 1,
            name: '장혜리',
            isHost: true,
            joinedStatus: 'APPROVED',
            joinMessage: '내가 대장',
            hostMemo: '내가 대장',
          },
        ],
      },
    ],
  })
  baropots: {
    id: number;
    host: {
      userId: number;
      name: string;
    };
    participantCount: number;
    pendingParticipantCount: number;
    participants: {
      userId: number;
      name: string;
      isHost: boolean;
      joinedStatus: BaropotJoinedStatus;
      joinMessage: string | null;
      hostMemo: string | null;
    }[];
  }[];

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

    this.baropots = restaurant.baropots
      .filter((baropot) => baropot.status === BaropotStatus.OPEN)
      .map((baropot) => ({
        id: baropot.id,
        host: {
          userId: baropot.baropotParticipants.find(
            (participant) => participant.isHost,
          )?.user.id,
          name: baropot.baropotParticipants.find(
            (participant) => participant.isHost,
          )?.user.name,
        },
        participantCount: sumBy(
          baropot.baropotParticipants,
          ({ joinedStatus }) =>
            Number(joinedStatus === BaropotJoinedStatus.APPROVED),
        ),
        pendingParticipantCount: sumBy(
          baropot.baropotParticipants,
          ({ joinedStatus }) =>
            Number(joinedStatus === BaropotJoinedStatus.PENDING),
        ),
        participants: map(baropot.baropotParticipants, (participant) => ({
          userId: participant.user.id,
          name: participant.user.name,
          isHost: participant.isHost,
          joinedStatus: participant.joinedStatus,
          joinMessage: participant.joinMessage,
          hostMemo: participant.hostMemo,
        })),
      }));
  }
}
