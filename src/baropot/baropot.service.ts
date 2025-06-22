import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBaropotReqDto } from './dto/request/create-baropot.req.dto';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotToBaropotTag } from 'src/entities/baropot/baropot-to-baropot-tag.entity';
import { BaropotTag } from 'src/entities/baropot/baropot-tag.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { FindBaropotResDto } from './dto/response/find-baropot.res.dto';

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
      return baropot;
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
