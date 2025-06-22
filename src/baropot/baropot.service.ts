import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBaropotReqDto } from './dto/request/create-baropot.req.dto';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotToBaropotTag } from 'src/entities/baropot/baropot-to-baropot-tag.entity';
import { BaropotTag } from 'src/entities/baropot/baropot-tag.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { FindBaropotResDto } from './dto/response/find-baropot.res.dto';
import { UpdateBaropotReqDto } from './dto/request/update-baropot.req.dto';
import { sumBy } from 'lodash';
import { isBefore } from 'date-fns';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';

@Injectable()
export class BaropotService {
  constructor(
    @InjectRepository(Baropot)
    private readonly baropotRepository: Repository<Baropot>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllBaropots() {
    return this.baropotRepository.find({
      relations: {
        baropotParticipants: true,
        baropotToBaropotTags: {
          baropotTag: true,
        },
        restaurant: true,
      },
    });
  }

  async findBaropotById(baropotId: number) {
    const baropot = await this.baropotRepository.findOne({
      where: { id: baropotId },
      relations: {
        baropotParticipants: {
          user: true,
        },
        baropotToBaropotTags: {
          baropotTag: true,
        },
        restaurant: true,
      },
    });

    if (!baropot) {
      throw new NotFoundException(
        `바로팟을 찾을 수 없습니다. (ID: ${baropotId})`,
      );
    }

    return new FindBaropotResDto(baropot);
  }

  async createBaropot({
    userId,
    dto,
  }: {
    userId: number;
    dto: CreateBaropotReqDto;
  }) {
    const {
      restaurantId,
      title,
      location,
      maxParticipants,
      date,
      time,
      participantGender,
      participantAgeGroup,
      contactMethod,
      estimatedCostPerPerson,
      paymentMethod,
      description,
      rule,
      tags: tagNames,
    } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 바로팟 엔티티 생성
      const baropot = await queryRunner.manager.save(Baropot, {
        restaurant: { id: restaurantId },
        title,
        location,
        maxParticipants,
        date,
        time,
        participantGender,
        participantAgeGroup,
        contactMethod,
        estimatedCostPerPerson,
        paymentMethod,
        description,
        rule,
      });

      // 바로팟 태그 생성
      for (const tagName of tagNames) {
        let tag = await queryRunner.manager.findOne(BaropotTag, {
          where: {
            name: tagName,
          },
        });

        if (!tag) {
          tag = queryRunner.manager.create(BaropotTag, { name: tagName });
          await queryRunner.manager.save(BaropotTag, tag);
        }

        await queryRunner.manager.save(BaropotToBaropotTag, {
          baropot: { id: baropot.id },
          baropotTag: { id: tag.id },
        });
      }

      // 바로팟을 생성하는 유저를 호스트로 등록
      await queryRunner.manager.save(BaropotParticipant, {
        baropot: { id: baropot.id },
        user: {
          id: userId,
        },
        isHost: true,
        joinedStatus: BaropotJoinedStatus.APPROVED, // 호스트는 승인상태가 디폴트
      });

      await queryRunner.commitTransaction();
      return await this.findBaropotById(baropot.id);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBaropot({
    baropotId,
    dto,
    userId,
  }: {
    baropotId: number;
    dto: UpdateBaropotReqDto;
    userId: number;
  }) {
    const {
      title,
      location,
      maxParticipants,
      date,
      time,
      participantGender,
      participantAgeGroup,
      contactMethod,
      estimatedCostPerPerson,
      paymentMethod,
      description,
      rule,
      tags: tagNames,
    } = dto;

    const baropot = await this.baropotRepository.findOne({
      where: { id: baropotId },
      relations: {
        baropotParticipants: {
          user: true,
        },
      },
    });

    if (!baropot) {
      throw new NotFoundException(
        `바로팟을 찾을 수 없습니다. (ID: ${baropotId})`,
      );
    }

    const host = baropot.baropotParticipants.find(
      (participant) => participant.isHost,
    );

    if (!host) {
      throw new NotFoundException('바로팟 주최자를 찾을 수 없습니다.');
    }

    if (host.user.id !== userId) {
      throw new ForbiddenException('바로팟 수정 권한이 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if ('maxParticipants' in dto) {
        const activeParticipantCount = sumBy(
          baropot.baropotParticipants,
          ({ joinedStatus }) =>
            Number(joinedStatus === BaropotJoinedStatus.APPROVED),
        );

        if (maxParticipants < activeParticipantCount) {
          throw new BadRequestException(
            `현재 활성 참가자수(${activeParticipantCount}명)보다 적게 최대참가자수를 수정할 수 없습니다.`,
          );
        }
      }

      if ('date' in dto || 'time' in dto) {
        const baropotDate = new Date(
          `${date ?? baropot.date}T${time ?? baropot.time}`,
        );

        if (isBefore(baropotDate, new Date())) {
          throw new BadRequestException(
            '바로팟 모임 날짜와 시간은 현재 시간 이후여야 합니다.',
          );
        }
      }

      if ('tags' in dto) {
        await queryRunner.manager.delete(BaropotToBaropotTag, {
          baropot: { id: baropotId },
        });

        for (const tagName of tagNames) {
          let tag = await queryRunner.manager.findOne(BaropotTag, {
            where: {
              name: tagName,
            },
          });

          if (!tag) {
            tag = queryRunner.manager.create(BaropotTag, { name: tagName });
            await queryRunner.manager.save(BaropotTag, tag);
          }

          await queryRunner.manager.save(BaropotToBaropotTag, {
            baropot: { id: baropotId },
            baropotTag: { id: tag.id },
          });
        }
      }

      await queryRunner.manager.update(
        Baropot,
        { id: baropotId },
        {
          title,
          location,
          maxParticipants,
          date,
          time,
          participantGender,
          participantAgeGroup,
          contactMethod,
          estimatedCostPerPerson,
          paymentMethod,
          description,
          rule,
        },
      );

      await queryRunner.commitTransaction();

      // 트랜잭션 성공 후 알림 전송
      await this.sendNotificationToParticipants({ baropotId, userId, dto });

      return await this.findBaropotById(baropotId);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async sendNotificationToParticipants({
    baropotId,
    userId,
    dto,
  }: {
    baropotId: number;
    userId: number;
    dto: UpdateBaropotReqDto;
  }) {
    const baropot = await this.baropotRepository.findOne({
      where: { id: baropotId },
      relations: {
        baropotParticipants: {
          user: true,
        },
      },
    });

    const isDateChanged = 'date' in dto && dto.date !== baropot.date;
    const isTimeChanged = 'time' in dto && dto.time !== baropot.time;

    if (isDateChanged || isTimeChanged) {
      const participants = baropot.baropotParticipants.filter(
        (participant) =>
          participant.joinedStatus === BaropotJoinedStatus.APPROVED &&
          !participant.isHost,
      );

      console.log(
        `[바로팟 알림] 바로팟 ID: ${baropotId}, 제목: "${baropot.title}"`,
      );
      console.log(
        `[바로팟 알림] 변경사항 - 날짜: ${isDateChanged ? '변경됨' : '변경없음'}, 시간: ${isTimeChanged ? '변경됨' : '변경없음'}`,
      );
      console.log(
        `[바로팟 알림] 알림 대상 참가자 수: ${participants.length}명`,
      );

      // 각 참가자에게 알림 전송
      for (const participant of participants) {
        console.log(
          `[바로팟 알림] 참가자 ID: ${participant.user.id}에게 알림 전송 중...`,
        );

        try {
          await this.notificationService.createNotification({
            type: NotificationType.BAROPOT_DATETIME_CHANGED,
            message: `"${baropot.title}" 바로팟의 날짜 또는 시간이 변경되었습니다.`,
            recipientId: participant.user.id,
            senderId: userId,
            restaurantId: baropot.restaurant.id,
          });
          console.log(
            `[바로팟 알림] 참가자 ID: ${participant.user.id}에게 알림 전송 완료`,
          );
        } catch (error) {
          console.error(
            `[바로팟 알림] 참가자 ID: ${participant.user.id}에게 알림 전송 실패:`,
            error,
          );
        }
      }

      console.log(`[바로팟 알림] 모든 알림 전송 완료`);
    } else {
      console.log(`[바로팟 알림] 날짜/시간 변경사항 없음 - 알림 전송하지 않음`);
    }
  }
}
