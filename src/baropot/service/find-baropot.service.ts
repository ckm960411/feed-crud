import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { Between, ILike, In, Repository } from 'typeorm';
import { calculateBoundingBox } from 'src/utils/location.utils';
import { map } from 'lodash';
import { FindAllBaropotReqQuery } from '../dto/request/find-all-baropot.req.query';
import { FindBaropotResDto } from '../dto/response/find-baropot.res.dto';

@Injectable()
export class FindBaropotService {
  constructor(
    @InjectRepository(Baropot)
    private readonly baropotRepository: Repository<Baropot>,
  ) {}

  async findAllBaropots({
    query,
    userId,
  }: {
    query?: FindAllBaropotReqQuery;
    userId?: number;
  }) {
    // 검색 조건을 동적으로 구성
    const whereConditions = this.getWhereConditions({ query, userId });

    const baropots = await this.baropotRepository.find({
      where: whereConditions,
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

    return map(baropots, (baropot) => new FindBaropotResDto(baropot));
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

  private getWhereConditions({
    query,
    userId,
  }: {
    query?: FindAllBaropotReqQuery;
    userId?: number;
  }): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (query) {
      // 바로팟 상태 검색 (빈 문자열이 아닐 때만)
      if (query.statusList && query.statusList.length > 0) {
        whereConditions.status = In(query.statusList);
      }

      // 바로팟 타이틀 검색 (빈 문자열이 아닐 때만)
      if (query.title && query.title.trim() !== '') {
        whereConditions.title = ILike(`%${query.title.trim()}%`);
      }

      // 바로팟 태그 검색 (빈 배열이 아닐 때만)
      if (query.tags && query.tags.length > 0) {
        whereConditions.baropotToBaropotTags = {
          baropotTag: {
            name: In(query.tags),
          },
        };
      }

      // 바로팟 참가자 성별 검색 (빈 배열이 아닐 때만)
      if (
        query.participantGenderList &&
        query.participantGenderList.length > 0
      ) {
        whereConditions.participantGender = In(query.participantGenderList);
      }

      // 바로팟 참가자 나이 그룹 검색 (빈 배열이 아닐 때만)
      if (
        query.participantAgeGroupList &&
        query.participantAgeGroupList.length > 0
      ) {
        whereConditions.participantAgeGroup = In(query.participantAgeGroupList);
      }

      // 맛집 이름 검색 (빈 문자열이 아닐 때만)
      if (query.restaurantName && query.restaurantName.trim() !== '') {
        whereConditions.restaurant = {
          name: ILike(`%${query.restaurantName.trim()}%`),
        };
      }

      // 맛집 카테고리 검색 (빈 문자열이 아닐 때만)
      if (query.restaurantCategory) {
        whereConditions.restaurant = {
          category: query.restaurantCategory,
        };
      }

      // 주소 검색 (빈 문자열이 아닐 때만)
      if (query.address && query.address.trim() !== '') {
        whereConditions.restaurant = {
          address: ILike(`%${query.address.trim()}%`),
        };
      }

      // 위치 기반 검색이 있는 경우
      if (query.lat && query.lng) {
        const radius = query.radius || 10; // 기본 10km
        const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(
          query.lat,
          query.lng,
          radius,
        );

        whereConditions.restaurant = {
          lat: Between(minLat, maxLat),
          lng: Between(minLng, maxLng),
        };
      }
    }

    if (userId) {
      whereConditions.baropotParticipants = {
        user: {
          id: userId,
        },
      };
    }

    return whereConditions;
  }
}
