import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRestaurantReservationReqDto } from '../dto/request/create-restaurant-reservation.req.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/entities/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { RestaurantReservation } from 'src/entities/restaurant/restaurant-reservation.entity';
import { RestaurantReservationStatus } from 'src/types/enum/restaurant-reservation-status.enum';

@Injectable()
export class RestaurantReservationService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantReservation)
    private readonly restaurantReservationRepository: Repository<RestaurantReservation>,
  ) {}

  async createRestaurantReservation({
    userId,
    restaurantId,
    dto,
  }: {
    userId: number;
    restaurantId: number;
    dto: CreateRestaurantReservationReqDto;
  }) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `맛집을 찾을 수 없습니다. (Restaurant ID: ${restaurantId})`,
      );
    }

    const openingTime = new Date(`${dto.date}T${restaurant.openingTime}`);
    const lastOrderTime = new Date(`${dto.date}T${restaurant.lastOrderTime}`);
    const reservationTime = new Date(`${dto.date}T${dto.time}`);

    if (reservationTime < openingTime || reservationTime > lastOrderTime) {
      throw new BadRequestException(
        `예약 가능한 시간이 아닙니다. (오픈시간: ${restaurant.openingTime}, 라스트오더: ${restaurant.lastOrderTime})`,
      );
    }

    const reservedReservation =
      await this.restaurantReservationRepository.findOne({
        where: {
          restaurant: { id: restaurantId },
          date: dto.date,
          time: dto.time,
        },
      });

    if (reservedReservation) {
      throw new BadRequestException(
        `이미 예약된 시간입니다. (Date: ${dto.date}, Time: ${dto.time})`,
      );
    }

    const reservation = this.restaurantReservationRepository.create({
      ...dto,
      restaurant: { id: restaurantId },
      user: { id: userId },
      status: RestaurantReservationStatus.APPROVED,
    });

    return this.restaurantReservationRepository.save(reservation);
  }
}
