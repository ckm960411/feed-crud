import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { DataSource, Repository } from 'typeorm';
import { RegisterRestaurantReqDto } from '../dto/request/register-restaurant.req.dto';
import { RestaurantTag } from 'src/entities/restaurant/restaurant-tag.entity';
import { RestaurantToRestaurantTag } from 'src/entities/restaurant/restaurant-to-restaurant-tag.entity';
import { RestaurantPhoto } from 'src/entities/restaurant/restaurant-photo.entity';
import { map } from 'lodash';
import { FindAllRestaurantsResDto } from '../dto/response/find-all-restaurants.res.dto';
import { FindOneRestaurantResDto } from '../dto/response/find-one-restaurant.res.dto';
import { UpdateRestaurantReqDto } from '../dto/request/update-restaurant.req.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId?: number) {
    const restaurants = await this.restaurantRepository.find({
      relations: {
        photos: true,
        restaurantToRestaurantTags: {
          restaurantTag: true,
        },
        reviews: true,
        bookmarks: {
          user: true,
        },
      },
    });

    return map(
      restaurants,
      (restaurant) => new FindAllRestaurantsResDto(restaurant, userId),
    );
  }

  async findOne(restaurantId: number, userId?: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: {
        id: restaurantId,
      },
      relations: {
        photos: true,
        restaurantToRestaurantTags: {
          restaurantTag: true,
        },
        user: true,
        reviews: {
          photos: true,
          user: true,
        },
        bookmarks: {
          user: true,
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `ID ${restaurantId} 맛집을 찾을 수 없습니다.`,
      );
    }

    return new FindOneRestaurantResDto(restaurant, userId);
  }

  async register(userId: number, dto: RegisterRestaurantReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        name,
        category,
        address,
        lat,
        lng,
        description,
        phoneNumber,
        openingTime,
        closingTime,
        lastOrderTime,
        tags: tagNames,
        photos,
      } = dto;

      const restaurant = queryRunner.manager.create(Restaurant, {
        name,
        category,
        address,
        lat,
        lng,
        description,
        phoneNumber,
        openingTime,
        closingTime,
        lastOrderTime,
        user: { id: userId },
      });

      await queryRunner.manager.save(restaurant);

      for (const tagName of tagNames) {
        let tag = await queryRunner.manager.findOne(RestaurantTag, {
          where: {
            name: tagName,
          },
        });

        if (!tag) {
          tag = queryRunner.manager.create(RestaurantTag, { name: tagName });
          await queryRunner.manager.save(RestaurantTag, tag);
        }

        await queryRunner.manager.save(RestaurantToRestaurantTag, {
          restaurant: { id: restaurant.id },
          restaurantTag: { id: tag.id },
        });
      }

      await queryRunner.manager.save(
        RestaurantPhoto,
        map(photos, (photo) => ({
          url: photo,
          restaurant: { id: restaurant.id },
        })),
      );

      await queryRunner.commitTransaction();
      return restaurant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update({
    userId,
    restaurantId,
    dto,
  }: {
    userId: number;
    restaurantId: number;
    dto: UpdateRestaurantReqDto;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        name,
        category,
        address,
        lat,
        lng,
        description,
        phoneNumber,
        openingTime,
        closingTime,
        lastOrderTime,
        tags: tagNames,
        photos,
      } = dto;

      const restaurant = await queryRunner.manager.findOne(Restaurant, {
        where: { id: restaurantId },
        relations: {
          user: true,
        },
      });

      if (!restaurant) {
        throw new NotFoundException(
          `ID ${restaurantId} 맛집을 찾을 수 없습니다.`,
        );
      }

      if (restaurant.user.id !== userId) {
        throw new ForbiddenException(
          `ID ${restaurantId} 맛집을 수정할 권한이 없습니다.`,
        );
      }

      restaurant.name = name;
      restaurant.category = category;
      restaurant.address = address;
      restaurant.lat = lat;
      restaurant.lng = lng;
      restaurant.description = description;
      restaurant.phoneNumber = phoneNumber;
      restaurant.openingTime = openingTime;
      restaurant.closingTime = closingTime;
      restaurant.lastOrderTime = lastOrderTime;

      await queryRunner.manager.save(restaurant);

      if ('tags' in dto) {
        await queryRunner.manager.delete(RestaurantToRestaurantTag, {
          restaurant: { id: restaurant.id },
        });

        for (const tagName of tagNames) {
          let tag = await queryRunner.manager.findOne(RestaurantTag, {
            where: {
              name: tagName,
            },
          });

          if (!tag) {
            tag = queryRunner.manager.create(RestaurantTag, { name: tagName });
            await queryRunner.manager.save(RestaurantTag, tag);
          }

          await queryRunner.manager.save(RestaurantToRestaurantTag, {
            restaurant: { id: restaurant.id },
            restaurantTag: { id: tag.id },
          });
        }
      }

      if ('photos' in dto) {
        await queryRunner.manager.delete(RestaurantPhoto, {
          restaurant: { id: restaurant.id },
        });

        await queryRunner.manager.save(
          RestaurantPhoto,
          map(photos, (photo) => ({
            url: photo,
            restaurant: { id: restaurant.id },
          })),
        );
      }

      await queryRunner.commitTransaction();

      return await this.findOne(restaurantId, userId);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete({
    userId,
    restaurantId,
  }: {
    userId: number;
    restaurantId: number;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const restaurant = await queryRunner.manager.findOne(Restaurant, {
        where: { id: restaurantId },
        relations: {
          user: true,
        },
      });

      if (!restaurant) {
        throw new NotFoundException(
          `ID ${restaurantId} 맛집을 찾을 수 없습니다.`,
        );
      }

      if (restaurant.user.id !== userId) {
        throw new ForbiddenException(
          `ID ${restaurantId} 맛집을 삭제할 권한이 없습니다.`,
        );
      }

      await queryRunner.manager.delete(Restaurant, { id: restaurantId });

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
