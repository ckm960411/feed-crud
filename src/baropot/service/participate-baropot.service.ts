import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParticipateBaropotReqDto } from '../dto/request/participate-baropot.req.dto';
import { FindBaropotService } from '../dto/service/find-baropot.service';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';
import { HandleParticipantRequestReqDto } from '../dto/request/handle-participant-request.req.dto';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';

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
    userId: number; // 바로팟 참가요청자
    dto: ParticipateBaropotReqDto;
  }) {
    const baropot = await this.findBaropotService.findBaropotById(baropotId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (baropot.host.userId === userId) {
        throw new BadRequestException(
          '이미 호스트인 바로팟엔 참가할 수 없습니다.',
        );
      }

      const meParticipant = baropot.participants.find(
        (participant) => participant.userId === userId,
      );
      if (meParticipant) {
        if (meParticipant.joinedStatus === BaropotJoinedStatus.PENDING) {
          throw new BadRequestException(
            '이미 참가 요청을 하셨습니다. 참가 요청을 처리해주세요.',
          );
        }

        if (meParticipant.joinedStatus === BaropotJoinedStatus.APPROVED) {
          throw new BadRequestException('이미 참가요청이 승인되었습니다.');
        }

        if (meParticipant.joinedStatus === BaropotJoinedStatus.REJECTED) {
          throw new BadRequestException('이미 참가 요청이 거절되었습니다.');
        }

        if (meParticipant.joinedStatus === BaropotJoinedStatus.CANCELLED) {
          throw new BadRequestException('이미 참가 요청이 취소되었습니다.');
        }

        if (meParticipant.joinedStatus === BaropotJoinedStatus.LEFT) {
          throw new BadRequestException('이미 바로팟에서 나갔습니다.');
        }

        if (meParticipant.joinedStatus === BaropotJoinedStatus.REMOVED) {
          throw new BadRequestException('이미 바로팟에서 강제 퇴장되었습니다.');
        }
      }

      if (baropot.maxParticipants <= baropot.participants.length) {
        throw new BadRequestException('바로팟 참가 인원이 초과되었습니다.');
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

  async handleParticipantJoinRequest({
    baropotId,
    userId,
    dto,
  }: {
    baropotId: number;
    userId: number; // 바로팟 참가요청을 처리하는 호스트의 User ID
    dto: HandleParticipantRequestReqDto;
  }) {
    const { participantUserId, joinedStatus, hostMemo } = dto;

    const baropot = await this.findBaropotService.findBaropotById(baropotId);

    if (baropot.host.userId !== userId) {
      throw new BadRequestException('호스트만 참가 요청을 처리할 수 있습니다.');
    }

    if (participantUserId === userId) {
      throw new BadRequestException(
        '자기 자신을 참가 요청 처리할 수 없습니다.',
      );
    }

    if (baropot.participantCount >= baropot.maxParticipants) {
      throw new BadRequestException('바로팟 참가 인원이 초과되었습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 참가자 정보 조회
      const participant = await queryRunner.manager.findOne(
        BaropotParticipant,
        {
          where: {
            user: { id: participantUserId },
            baropot: { id: baropotId },
            joinedStatus: BaropotJoinedStatus.PENDING,
          },
          relations: ['user'],
        },
      );

      if (!participant) {
        throw new BadRequestException('처리할 참가 요청을 찾을 수 없습니다.');
      }

      let notificationMessage: string;

      if (joinedStatus === BaropotJoinedStatus.APPROVED) {
        notificationMessage = `"${baropot.title}" 바로팟 참가가 승인되었습니다.`;
      } else {
        notificationMessage = `"${baropot.title}" 바로팟 참가가 거절되었습니다.${hostMemo ? ` 사유: ${hostMemo}` : ''}`;
      }

      // 참가자 상태 업데이트
      await queryRunner.manager.update(
        BaropotParticipant,
        {
          user: { id: participantUserId },
          baropot: { id: baropotId },
        },
        { joinedStatus, hostMemo },
      );

      // 알림 생성
      await this.notificationService.createNotification({
        type:
          joinedStatus === BaropotJoinedStatus.APPROVED
            ? NotificationType.BAROPOT_PARTICIPANT_JOIN_REQUEST_APPROVED
            : NotificationType.BAROPOT_PARTICIPANT_JOIN_REQUEST_REJECTED,
        message: notificationMessage,
        recipientId: participant.user.id,
        senderId: userId,
        restaurantId: baropot.restaurant.id,
      });

      // 현재 추가된 인원을 포함해 정원이 찼다면 바로팟을 FULL 상태로 변경
      if (
        joinedStatus === BaropotJoinedStatus.APPROVED &&
        baropot.participantCount + 1 === baropot.maxParticipants
      ) {
        await queryRunner.manager.update(
          Baropot,
          { id: baropotId },
          { status: BaropotStatus.FULL },
        );
      }

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
