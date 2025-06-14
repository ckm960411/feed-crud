import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantReviewPhoto } from 'src/entities/restaurant/restaurant-review-photo.entity';
import { RestaurantReview } from 'src/entities/restaurant/restaurant-review.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateRestaurantReviewReqDto } from '../dto/request/create-review.req.dto';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { map } from 'lodash';

@Injectable()
export class RestaurantReviewService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantReview)
    private readonly restaurantReviewRepository: Repository<RestaurantReview>,
    @InjectRepository(RestaurantReviewPhoto)
    private readonly restaurantReviewPhotoRepository: Repository<RestaurantReviewPhoto>,
    private readonly dataSource: DataSource,
  ) {}

  async createReview({
    userId,
    restaurantId,
    dto,
  }: {
    userId: number;
    restaurantId: number;
    dto: CreateRestaurantReviewReqDto;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const restaurant = await queryRunner.manager.findOne(Restaurant, {
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException(
          `ID ${restaurantId} 맛집을 찾을 수 없습니다.`,
        );
      }

      const { rating, content, photos } = dto;

      const review = queryRunner.manager.create(RestaurantReview, {
        rating,
        content,
        user: { id: userId },
        restaurant: { id: restaurantId },
      });

      await queryRunner.manager.save(review);

      const reviewPhotos = map(photos, (url) => {
        return queryRunner.manager.create(RestaurantReviewPhoto, {
          review: { id: review.id },
          url,
        });
      });

      await queryRunner.manager.save(reviewPhotos);

      await queryRunner.commitTransaction();
      return review;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
