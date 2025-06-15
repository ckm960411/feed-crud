import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantReviewPhoto } from 'src/entities/restaurant/restaurant-review-photo.entity';
import { RestaurantReview } from 'src/entities/restaurant/restaurant-review.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateRestaurantReviewReqDto } from '../dto/request/create-review.req.dto';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { map } from 'lodash';
import { FindReviewResponse } from '../dto/response/find-review.response';
import { UpdateRestaurantReviewReqDto } from '../dto/request/upate-restaurant-review.req.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';

@Injectable()
export class RestaurantReviewService {
  constructor(
    @InjectRepository(RestaurantReview)
    private readonly restaurantReviewRepository: Repository<RestaurantReview>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllReviewsByRestaurantId(restaurantId: number) {
    const reviews = await this.restaurantReviewRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: {
        user: true,
        photos: true,
      },
    });

    return map(reviews, (review) => {
      return new FindReviewResponse(review);
    });
  }

  async findOneReviewById(reviewId: number) {
    const review = await this.restaurantReviewRepository.findOne({
      where: { id: reviewId },
      relations: {
        user: true,
        photos: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`ID ${reviewId} 리뷰를 찾을 수 없습니다.`);
    }

    return new FindReviewResponse(review);
  }

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
        relations: ['user'],
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

      // 맛집 주인에게 알림 발송
      if (restaurant.user.id !== userId) {
        await this.notificationService.createNotification({
          type: NotificationType.REVIEW,
          message: `${restaurant.name}에 새로운 리뷰가 등록되었습니다.`,
          recipientId: restaurant.user.id,
          senderId: userId,
          restaurantId,
        });
      }

      await queryRunner.commitTransaction();
      return review;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateReview({
    userId,
    reviewId,
    dto,
  }: {
    userId: number;
    reviewId: number;
    dto: UpdateRestaurantReviewReqDto;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = await queryRunner.manager.findOne(RestaurantReview, {
        where: { id: reviewId },
        relations: {
          user: true,
          photos: true,
        },
      });

      if (!review) {
        throw new NotFoundException(`ID ${reviewId} 리뷰를 찾을 수 없습니다.`);
      }

      if (review.user.id !== userId) {
        throw new ForbiddenException('리뷰 수정 권한이 없습니다.');
      }

      const { rating, content, photos } = dto;

      review.rating = rating;
      review.content = content;

      await queryRunner.manager.save(review);

      await queryRunner.manager.delete(RestaurantReviewPhoto, {
        review: { id: review.id },
      });

      const reviewPhotos = map(photos, (url) => {
        return queryRunner.manager.create(RestaurantReviewPhoto, {
          review: { id: review.id },
          url,
        });
      });

      await queryRunner.manager.save(reviewPhotos);

      await queryRunner.commitTransaction();
      const updatedReview = await queryRunner.manager.findOne(
        RestaurantReview,
        {
          where: { id: reviewId },
          relations: {
            user: true,
            photos: true,
          },
        },
      );
      return new FindReviewResponse(updatedReview);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteReview({
    userId,
    reviewId,
  }: {
    userId: number;
    reviewId: number;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = await queryRunner.manager.findOne(RestaurantReview, {
        where: { id: reviewId },
        relations: {
          user: true,
        },
      });

      if (!review) {
        throw new NotFoundException(`ID ${reviewId} 리뷰를 찾을 수 없습니다.`);
      }

      if (review.user.id !== userId) {
        throw new ForbiddenException('리뷰 삭제 권한이 없습니다.');
      }

      await queryRunner.manager.delete(RestaurantReviewPhoto, {
        review: { id: review.id },
      });

      await queryRunner.manager.delete(RestaurantReview, {
        id: reviewId,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
