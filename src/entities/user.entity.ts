import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Feed } from './feed.entity';
import { FeedComment } from './comment.entity';
import { Like } from './like.entity';
import { Restaurant } from './restaurant/restaurant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantBookmark } from './restaurant/restaurant-bookmark.entity';
import { RestaurantReview } from './restaurant/restaurant-review.entity';
import { Notification } from './notification.entity';
import { BaropotParticipant } from './baropot/baropot-participant.entity';
import { RestaurantReservation } from './restaurant/restaurant-reservation.entity';
import { SigninMethod } from 'src/auth/types/signin-method.enum';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Object.values(SigninMethod),
    default: SigninMethod.LOCAL,
  })
  provider: SigninMethod;

  @Column({ nullable: true })
  providerId: string;

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

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  @OneToMany(
    () => BaropotParticipant,
    (baropotParticipant) => baropotParticipant.user,
  )
  baropotParticipants: BaropotParticipant[];

  @OneToMany(() => RestaurantReservation, (reservation) => reservation.user)
  restaurantReservations: RestaurantReservation[];
}
