import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantReview } from './restaurant-review.entity';

@Entity()
export class RestaurantReviewPhoto extends BaseEntity {
  @ApiProperty({
    description: '리뷰 사진 URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  @Column()
  url: string;

  @ApiProperty({
    description: '리뷰',
  })
  @ManyToOne(() => RestaurantReview, (review) => review.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  review: RestaurantReview;
}
