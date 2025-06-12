import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Feed } from './feed.entity';
import { FeedComment } from './comment.entity';
import { Like } from './like.entity';
import { Restaurant } from './restaurant/restaurant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantBookmark } from './restaurant/restaurant-bookmark.entity';
import { RestaurantReview } from './restaurant/restaurant-review.entity';

@Entity()
export class User extends BaseEntity {
  @ApiProperty({
    description: '유저 이름',
    example: '홍길동',
  })
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    description: '유저가 등록한 맛집 목록',
  })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.user)
  restaurants: Restaurant[];

  @ApiProperty({
    description: '유저가 북마크 목록',
  })
  @OneToMany(() => RestaurantBookmark, (bookmark) => bookmark.user)
  bookmarks: RestaurantBookmark[];

  @ApiProperty({
    description: '유저가 작성한 맛집 리뷰 목록',
  })
  @OneToMany(() => RestaurantReview, (review) => review.user)
  restaurantReviews: RestaurantReview[];

  @OneToMany(() => Feed, (feed) => feed.user)
  feeds: Feed[];

  @OneToMany(() => FeedComment, (comment) => comment.user)
  comments: FeedComment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
