import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantBookmark } from 'src/entities/restaurant/restaurant-bookmark.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantBookmarkService {
  constructor(
    @InjectRepository(RestaurantBookmark)
    private readonly restaurantBookmarkRepository: Repository<RestaurantBookmark>,
  ) {}

  async addBookmarkRestaurant({
    userId,
    restaurantId,
  }: {
    userId: number;
    restaurantId: number;
  }) {
    const restaurantBookmark = await this.findBookmarkRestaurants({
      userId,
      restaurantId,
    });

    if (restaurantBookmark) {
      throw new BadRequestException('이미 찜한 맛집입니다.');
    }

    this.restaurantBookmarkRepository.save({
      user: { id: userId },
      restaurant: { id: restaurantId },
    });

    return true;
  }

  async deleteBookmarkRestaurant({
    userId,
    restaurantId,
  }: {
    userId: number;
    restaurantId: number;
  }) {
    const restaurantBookmark = await this.findBookmarkRestaurants({
      userId,
      restaurantId,
    });

    if (!restaurantBookmark) {
      throw new NotFoundException('찜한 맛집을 찾을 수 없습니다.');
    }

    this.restaurantBookmarkRepository.delete({
      user: { id: userId },
      restaurant: { id: restaurantId },
    });

    return true;
  }

  async findBookmarkRestaurants({
    userId,
    restaurantId,
  }: {
    userId: number;
    restaurantId: number;
  }) {
    const restaurantBookmark = await this.restaurantBookmarkRepository.findOne({
      where: {
        user: { id: userId },
        restaurant: { id: restaurantId },
      },
    });

    return restaurantBookmark;
  }
}
