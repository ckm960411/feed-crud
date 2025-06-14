import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { RegisterRestaurantReqDto } from '../dto/request/register-restaurant.req.dto';
import { RestaurantTag } from 'src/entities/restaurant/restaurant-tag.entity';
import { RestaurantToRestaurantTag } from 'src/entities/restaurant/restaurant-to-restaurant-tag.entity';
import { RestaurantPhoto } from 'src/entities/restaurant/restaurant-photo.entity';
import { map } from 'lodash';
import { FindAllRestaurantsResDto } from '../dto/response/find-all-restaurants.res.dto';
import { FindOneRestaurantResDto } from '../dto/response/find-one-restaurant.res.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantTag)
    private readonly restaurantTagRepository: Repository<RestaurantTag>,
    @InjectRepository(RestaurantToRestaurantTag)
    private readonly restaurantToRestaurantTagRepository: Repository<RestaurantToRestaurantTag>,
    @InjectRepository(RestaurantPhoto)
    private readonly restaurantPhotoRepository: Repository<RestaurantPhoto>,
  ) {}

  async findAll() {
    const restaurants = await this.restaurantRepository.find({
      relations: {
        photos: true,
        restaurantToRestaurantTags: {
          restaurantTag: true,
        },
      },
    });

    return map(
      restaurants,
      (restaurant) => new FindAllRestaurantsResDto(restaurant),
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
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `ID ${restaurantId} 맛집을 찾을 수 없습니다.`,
      );
    }

    return new FindOneRestaurantResDto(
      restaurant,
      userId === restaurant.user.id,
    );
  }

  async register(userId: number, dto: RegisterRestaurantReqDto) {
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

    const restaurant = this.restaurantRepository.create({
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
    await this.restaurantRepository.save(restaurant);

    for (const tagName of tagNames) {
      let tag = await this.restaurantTagRepository.findOne({
        where: {
          name: tagName,
        },
      });

      if (!tag) {
        tag = this.restaurantTagRepository.create({ name: tagName });
        await this.restaurantTagRepository.save(tag);
      }

      await this.restaurantToRestaurantTagRepository.save({
        restaurant: { id: restaurant.id },
        restaurantTag: { id: tag.id },
      });
    }

    await this.restaurantPhotoRepository.save(
      map(photos, (photo) => ({
        url: photo,
        restaurant: { id: restaurant.id },
      })),
    );

    return restaurant;
  }
}
