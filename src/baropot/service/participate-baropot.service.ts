import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParticipateBaropotReqDto } from '../dto/request/participate-baropot.req.dto';
import { FindBaropotService } from '../dto/service/find-baropot.service';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';

@Injectable()
export class ParticipateBaropotService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly findBaropotService: FindBaropotService,
    private readonly notificationService: NotificationService,
  ) {}

  async participateBaropot({
    baropotId,
    userId,
    dto,
  }: {
    baropotId: number;
    userId: number;
    dto: ParticipateBaropotReqDto;
  }) {
    const baropot = await this.findBaropotService.findBaropotById(baropotId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (baropot.maxParticipants <= baropot.participants.length) {
        throw new BadRequestException('바로팟 참가 인원이 초과되었습니다.');
      }

      if (baropot.host.userId === userId) {
        throw new BadRequestException(
          '이미 호스트인 바로팟엔 참가할 수 없습니다.',
        );
      }

      await queryRunner.manager.save(BaropotParticipant, {
        baropot: { id: baropotId },
        user: { id: userId },
        joinMessage: dto.joinMessage,
        joinedStatus: BaropotJoinedStatus.PENDING, // 참가요청을 하는 사람은 기본으로 PENDING 상태입니다.
      });

      await this.notificationService.createNotification({
        type: NotificationType.BAROPOT_PARTICIPANT_JOINED,
        message: `"${baropot.title}" 바로팟에 참가 요청이 들어왔습니다.`,
        recipientId: baropot.host.userId,
        senderId: userId,
        restaurantId: baropot.restaurant.id,
      });

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
