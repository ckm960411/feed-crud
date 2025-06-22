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

@Injectable()
export class BaropotService {
  constructor(
    @InjectRepository(Baropot)
    private readonly baropotRepository: Repository<Baropot>,
    private readonly dataSource: DataSource,
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
}
