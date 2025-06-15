import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantBookmark } from 'src/entities/restaurant/restaurant-bookmark.entity';
import { Repository, DataSource } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';

@Injectable()
export class RestaurantBookmarkService {
  constructor(
    @InjectRepository(RestaurantBookmark)
    private readonly restaurantBookmarkRepository: Repository<RestaurantBookmark>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
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

    const restaurant = await this.dataSource
      .getRepository('Restaurant')
      .findOne({
        where: { id: restaurantId },
        relations: ['user'],
      });

    if (!restaurant) {
      throw new NotFoundException('맛집을 찾을 수 없습니다.');
    }

    await this.restaurantBookmarkRepository.save({
      user: { id: userId },
      restaurant: { id: restaurantId },
    });

    // 맛집 주인에게 알림 발송
    if (restaurant.user.id !== userId) {
      await this.notificationService.createNotification({
        type: NotificationType.BOOKMARK,
        message: `${restaurant.name}이(가) 찜 목록에 추가되었습니다.`,
        recipientId: restaurant.user.id,
        senderId: userId,
        restaurantId,
      });
    }

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
