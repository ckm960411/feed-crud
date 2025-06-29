import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantCategory } from 'src/types/enum/restaurant-category.enum';
import { User } from '../user.entity';
import { RestaurantToRestaurantTag } from './restaurant-to-restaurant-tag.entity';
import { RestaurantPhoto } from './restaurant-photo.entity';
import { RestaurantBookmark } from './restaurant-bookmark.entity';
import { RestaurantReview } from './restaurant-review.entity';
import { Baropot } from '../baropot/baropot.entity';
import { RestaurantReservation } from './restaurant-reservation.entity';

@Entity()
export class Restaurant extends BaseEntity {
  @ApiProperty({
    description: '맛집 이름',
    example: '이경문 순대곱창',
  })
  @IsString()
  @Column()
  name: string;

  @ApiProperty({
    description: '카테고리',
    example: 'KOREAN',
  })
  @IsEnum(RestaurantCategory)
  @Column({
    type: 'enum',
    enum: RestaurantCategory,
  })
  category: RestaurantCategory;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 종로구 종로3길 17',
  })
  @IsString()
  @Column()
  address: string;

  @ApiProperty({
    description: '위도',
    example: '37.565221',
  })
  @IsNumber()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
  })
  lat: number;

  @ApiProperty({
    description: '경도',
    example: '126.978144',
  })
  @IsNumber()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
  })
  lng: number;

  @ApiProperty({
    description: '가게 설명',
    example:
      '이경문 순대곱창은 서울특별시 종로구 종로3길 17에 위치한 맛집입니다.',
  })
  @IsString()
  @Column()
  description: string;

  @ApiProperty({
    description: '전화번호',
    example: '0212345678 (하이픈 없이 저장)',
  })
  @IsString()
  @Column()
  phoneNumber: string;

  @ApiProperty({
    description: '오픈 시간',
    example: '11:00',
  })
  @Matches(/^\d{2}:\d{2}$/)
  @Column()
  openingTime: string; // HH:mm

  @ApiProperty({
    description: '영업 종료 시간',
    example: '22:00',
  })
  @Matches(/^\d{2}:\d{2}$/)
  @Column()
  closingTime: string; // HH:mm

  @ApiProperty({
    description: '라스트오더 시간',
    example: '21:00',
  })
  @Matches(/^\d{2}:\d{2}$/)
  @Column()
  lastOrderTime: string; // HH:mm

  @ApiProperty({
    description: '맛집 등록 유저',
  })
  @ManyToOne(() => User, (user) => user.restaurants)
  @JoinColumn()
  user: User;

  @ApiProperty({
    description: '맛집 태그',
  })
  @OneToMany(
    () => RestaurantToRestaurantTag,
    (restaurantToRestaurantTag) => restaurantToRestaurantTag.restaurant,
  )
  restaurantToRestaurantTags: RestaurantToRestaurantTag[];

  @ApiProperty({
    description: '맛집 사진 목록',
  })
  @OneToMany(() => RestaurantPhoto, (photo) => photo.restaurant)
  photos: RestaurantPhoto[];

  @ApiProperty({
    description: '맛집 북마크 목록',
  })
  @OneToMany(() => RestaurantBookmark, (bookmark) => bookmark.restaurant)
  bookmarks: RestaurantBookmark[];

  @ApiProperty({
    description: '맛집 리뷰 목록',
  })
  @OneToMany(() => RestaurantReview, (review) => review.restaurant)
  reviews: RestaurantReview[];

  @OneToMany(() => Baropot, (baropot) => baropot.restaurant)
  baropots: Baropot[];

  @OneToMany(
    () => RestaurantReservation,
    (reservation) => reservation.restaurant,
  )
  reservations: RestaurantReservation[];
}
