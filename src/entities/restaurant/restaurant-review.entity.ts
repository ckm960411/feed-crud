import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { User } from '../user.entity';
import { Restaurant } from './restaurant.entity';
import { RestaurantReviewPhoto } from './restaurant-review-photo.entity';

@Entity()
export class RestaurantReview extends BaseEntity {
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
    description: '작성 유저',
  })
  @ManyToOne(() => User, (user) => user.restaurantReviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ApiProperty({
    description: '맛집',
  })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  restaurant: Restaurant;

  @ApiProperty({
    description: '리뷰 사진 목록',
  })
  @OneToMany(() => RestaurantReviewPhoto, (photo) => photo.review)
  photos: RestaurantReviewPhoto[];
}
