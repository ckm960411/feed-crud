import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RestaurantReservation } from 'src/entities/restaurant/restaurant-reservation.entity';
import { RestaurantReservationStatus } from 'src/types/enum/restaurant-reservation-status.enum';
import { addMinutes } from 'date-fns';

@Injectable()
export class RestaurantReservationCompletionService {
  private readonly logger = new Logger(
    RestaurantReservationCompletionService.name,
  );

  constructor(
    @InjectRepository(RestaurantReservation)
    private readonly restaurantReservationRepository: Repository<RestaurantReservation>,
  ) {}

  /**
   * 30분마다 실행되는 CronJob
   * 예약 시간으로부터 30분이 지난 예약들을 COMPLETED 상태로 변경
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async completeExpiredReservations() {
    this.logger.log('예약 완료 처리 작업 시작');

    try {
      // 현재 시간으로부터 30분 전 시간 계산
      const thirtyMinutesAgo = addMinutes(new Date(), -30);

      // 30분 전 이전에 예약된 시간이고, 아직 APPROVED 상태인 예약들 조회
      const expiredReservations =
        await this.restaurantReservationRepository.find({
          where: {
            status: RestaurantReservationStatus.APPROVED,
          },
        });

      // 시간까지 고려하여 필터링
      const reservationsToComplete = expiredReservations.filter(
        (reservation) => {
          const reservationDateTime = new Date(
            `${reservation.date}T${reservation.time}`,
          );
          return reservationDateTime < thirtyMinutesAgo;
        },
      );

      if (reservationsToComplete.length === 0) {
        this.logger.log('완료할 예약이 없습니다.');
        return;
      }

      // 예약 상태를 COMPLETED로 변경
      const reservationIds = reservationsToComplete.map(
        (reservation) => reservation.id,
      );

      await this.restaurantReservationRepository.update(
        { id: In(reservationIds) },
        { status: RestaurantReservationStatus.COMPLETED },
      );

      this.logger.log(
        `${reservationsToComplete.length}개의 예약이 완료 상태로 변경되었습니다. (예약 ID: ${reservationIds.join(', ')})`,
      );

      // 완료된 예약 정보 로깅
      reservationsToComplete.forEach((reservation) => {
        this.logger.log(
          `예약 완료: ID ${reservation.id}, 예약 시간 ${reservation.date} ${reservation.time}`,
        );
      });
    } catch (error) {
      this.logger.error('예약 완료 처리 중 오류 발생:', error);
    }
  }

  /**
   * 수동으로 예약 완료 처리 (테스트용)
   */
  async manuallyCompleteExpiredReservations() {
    this.logger.log('수동 예약 완료 처리 시작');
    await this.completeExpiredReservations();
  }
}
