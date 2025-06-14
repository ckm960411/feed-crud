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
import { User } from 'src/auth/decorators/user.decorator';
import { RestaurantReviewService } from './service/restaurant-review.service';

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
      User,
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, RestaurantReviewService],
})
export class RestaurantModule {}
