import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { DataSource } from 'typeorm';
import { CreateBaropotReqDto } from '../request/create-baropot.req.dto';
import { BaropotTag } from 'src/entities/baropot/baropot-tag.entity';
import { BaropotToBaropotTag } from 'src/entities/baropot/baropot-to-baropot-tag.entity';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';
import { FindBaropotService } from './find-baropot.service';

@Injectable()
export class CreateBaropotService {
  constructor(
    @InjectRepository(Baropot)
    private readonly dataSource: DataSource,
    private readonly findBaropotService: FindBaropotService,
  ) {}

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
      return await this.findBaropotService.findBaropotById(baropot.id);
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
