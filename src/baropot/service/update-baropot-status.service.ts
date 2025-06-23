import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateBaropotStatusReqDto } from '../dto/request/update-baropot-status.req.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import {
  BaropotStatus,
  baropotStatusKorean,
} from 'src/types/enum/baropot-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { FindBaropotService } from './find-baropot.service';

@Injectable()
export class UpdateBaropotStatusService {
  constructor(
    @InjectRepository(Baropot)
    private readonly baropotRepository: Repository<Baropot>,
    private readonly findBaropotService: FindBaropotService,
    private readonly notificationService: NotificationService,
  ) {}

  async updateBaropotStatus({
    baropotId,
    userId,
    dto: { status },
  }: {
    baropotId: number;
    userId: number;
    dto: UpdateBaropotStatusReqDto;
  }) {
    const baropot = await this.findBaropotService.findBaropotById(baropotId);

    if (baropot.host.userId !== userId) {
      throw new BadRequestException(
        '호스트만 바로팟 상태를 변경할 수 있습니다.',
      );
    }

    const canUpdateStatusList = {
      [BaropotStatus.IN_PROGRESS]: [BaropotStatus.OPEN, BaropotStatus.FULL], // 모집중 또는 모집완료 상태에서만 진행중으로 변경 가능
      [BaropotStatus.COMPLETED]: [BaropotStatus.IN_PROGRESS], // 진행중 상태에서만 완료로 변경 가능
      [BaropotStatus.CANCELLED]: [BaropotStatus.OPEN, BaropotStatus.FULL], // 모집중 또는 모집완료 상태에서만 취소로 변경 가능
    };

    if (!canUpdateStatusList[status].includes(baropot.status)) {
      throw new BadRequestException(
        `현재 바로팟이 ${baropot.status} 상태이므로 ${status} 상태로 변경할 수 없습니다. ${canUpdateStatusList[status].join(', ')} 상태에서만 ${status} 상태로 변경할 수 있습니다.`,
      );
    }

    await this.baropotRepository.update(baropotId, { status });

    // 바로팟의 승인된 참가자들에게 알림 발송 (호스트 제외)
    const participantIds = baropot.participants
      .filter(
        (participant) =>
          !participant.isHost &&
          participant.joinedStatus === BaropotJoinedStatus.APPROVED,
      )
      .map((participant) => participant.userId);

    if (participantIds.length > 0) {
      await this.notificationService.createMultipleNotifications({
        type: NotificationType.BAROPOT_STATUS_UPDATED,
        message: `"${baropot.title}" 바로팟 상태가 "${baropotStatusKorean[status]}" 상태로 변경되었습니다.`,
        recipientIds: participantIds,
        senderId: userId,
        restaurantId: baropot.restaurant.id,
      });
    }

    return true;
  }
}
