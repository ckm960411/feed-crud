import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './service/restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { RestaurantBookmark } from 'src/entities/restaurant/restaurant-bookmark.entity';
import { RestaurantPhoto } from 'src/entities/restaurant/restaurant-photo.entity';
import { RestaurantReview } from 'src/entities/restaurant/restaurant-review.entity';
import { RestaurantReviewPhoto } from 'src/entities/restaurant/restaurant-review-photo.entity';
import { RestaurantTag } from 'src/entities/restaurant/restaurant-tag.entity';
import { RestaurantToRestaurantTag } from 'src/entities/restaurant/restaurant-to-restaurant-tag.entity';
import { RestaurantReviewService } from './service/restaurant-review.service';
import { RestaurantBookmarkService } from './service/restaurant-bookmark.service';
import { NotificationModule } from 'src/notification/notification.module';
import { RestaurantReservation } from 'src/entities/restaurant/restaurant-reservation.entity';
import { RestaurantReservationService } from './service/restaurant-reservation.service';
import { RestaurantReservationCompletionService } from './service/restaurant-reservation-completion.service';
import { CouponModule } from 'src/coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantBookmark,
      RestaurantPhoto,
      RestaurantReview,
      RestaurantReviewPhoto,
      RestaurantTag,
      RestaurantToRestaurantTag,
      RestaurantReservation,
    ]),
    NotificationModule,
    CouponModule,
  ],
  controllers: [RestaurantController],
  providers: [
    RestaurantService,
    RestaurantReviewService,
    RestaurantBookmarkService,
    RestaurantReservationService,
    RestaurantReservationCompletionService,
  ],
})
export class RestaurantModule {}
