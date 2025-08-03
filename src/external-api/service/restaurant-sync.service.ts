import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Restaurant } from '../../entities/restaurant/restaurant.entity';
import { KakaoLocalService } from '../kakao-local.service';
import { KakaoToRestaurantMapper } from '../mapper/kakao-to-restaurant.mapper';

export interface SyncResult {
  totalFetched: number;
  newRestaurants: number;
  updatedRestaurants: number;
  skippedRestaurants: number;
  errors: string[];
}

@Injectable()
export class RestaurantSyncService {
  private readonly logger = new Logger(RestaurantSyncService.name);

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly kakaoLocalService: KakaoLocalService,
    private readonly mapper: KakaoToRestaurantMapper,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 카카오 API에서 인기 맛집 데이터를 동기화
   * @param searchQueries 검색할 키워드 배열
   * @returns 동기화 결과
   */
  async syncPopularRestaurants(
    searchQueries: string[] = ['맛집', '인기맛집', '유명맛집']
  ): Promise<SyncResult> {
    this.logger.log('Starting restaurant synchronization from Kakao API');
    
    const result: SyncResult = {
      totalFetched: 0,
      newRestaurants: 0,
      updatedRestaurants: 0,
      skippedRestaurants: 0,
      errors: [],
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 각 검색어로 맛집 데이터 수집
      for (const query of searchQueries) {
        try {
          this.logger.log(`Searching for: ${query}`);
          
          const searchResponse = await this.kakaoLocalService.searchRestaurants(query);
          const kakaoPlaces = searchResponse.documents;
          
          this.logger.log(`Found ${kakaoPlaces.length} places for query: ${query}`);
          result.totalFetched += kakaoPlaces.length;

          // 카카오 데이터를 Restaurant 엔티티로 변환
          const restaurantData = this.mapper.mapToRestaurants(kakaoPlaces);

          // 각 맛집 데이터 처리
          for (const data of restaurantData) {
            try {
              await this.processRestaurant(queryRunner, data, result);
            } catch (error) {
              const errorMsg = `Error processing restaurant ${data.name}: ${error.message}`;
              this.logger.error(errorMsg);
              result.errors.push(errorMsg);
            }
          }

          // API 호출 간격 (Rate Limiting 방지)
          await this.sleep(1000); // 1초 대기
        } catch (error) {
          const errorMsg = `Error searching for query ${query}: ${error.message}`;
          this.logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log('Restaurant synchronization completed successfully', result);
      
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Restaurant synchronization failed', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 개별 맛집 데이터 처리 (생성 또는 업데이트)
   */
  private async processRestaurant(
    queryRunner: any,
    data: Partial<Restaurant>,
    result: SyncResult
  ): Promise<void> {
    // 이미 존재하는 외부 맛집인지 확인
    const existingRestaurant = await queryRunner.manager.findOne(Restaurant, {
      where: {
        externalSource: 'kakao',
        externalId: data.externalId,
      },
    });

    if (existingRestaurant) {
      // 기존 데이터가 1주일 이상 오래된 경우에만 업데이트
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (existingRestaurant.lastSyncedAt < oneWeekAgo) {
        // 업데이트
        Object.assign(existingRestaurant, {
          ...data,
          id: existingRestaurant.id, // ID는 유지
          createdAt: existingRestaurant.createdAt, // 생성일은 유지
          lastSyncedAt: new Date(),
        });

        await queryRunner.manager.save(Restaurant, existingRestaurant);
        result.updatedRestaurants++;
        this.logger.debug(`Updated restaurant: ${data.name}`);
      } else {
        result.skippedRestaurants++;
        this.logger.debug(`Skipped recent restaurant: ${data.name}`);
      }
    } else {
      // 동일한 이름과 주소를 가진 내부 맛집이 있는지 확인
      const duplicateRestaurant = await queryRunner.manager.findOne(Restaurant, {
        where: {
          name: data.name,
          address: data.address,
          isExternal: false, // 내부 등록 맛집만 확인
        },
      });

      if (duplicateRestaurant) {
        result.skippedRestaurants++;
        this.logger.debug(`Skipped duplicate restaurant: ${data.name}`);
        return;
      }

      // 새로운 맛집 생성
      const newRestaurant = queryRunner.manager.create(Restaurant, data);
      await queryRunner.manager.save(Restaurant, newRestaurant);
      result.newRestaurants++;
      this.logger.debug(`Created new restaurant: ${data.name}`);
    }
  }

  /**
   * 특정 지역의 맛집 동기화
   * @param location 위치 정보
   * @param radius 반경 (미터)
   * @returns 동기화 결과
   */
  async syncRestaurantsByLocation(
    location: { lat: number; lng: number },
    radius: number = 5000
  ): Promise<SyncResult> {
    this.logger.log(`Syncing restaurants near location: ${location.lat}, ${location.lng}`);
    
    const searchQueries = ['맛집', '음식점'];
    const result: SyncResult = {
      totalFetched: 0,
      newRestaurants: 0,
      updatedRestaurants: 0,
      skippedRestaurants: 0,
      errors: [],
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const query of searchQueries) {
        const searchResponse = await this.kakaoLocalService.searchRestaurants(
          query,
          { ...location, radius }
        );
        
        const restaurantData = this.mapper.mapToRestaurants(searchResponse.documents);
        result.totalFetched += searchResponse.documents.length;

        for (const data of restaurantData) {
          await this.processRestaurant(queryRunner, data, result);
        }

        await this.sleep(1000);
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 지연 함수 (Rate Limiting 방지)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 동기화가 필요한지 확인
   * @returns 동기화 필요 여부
   */
  async needsSync(): Promise<boolean> {
    const externalRestaurantCount = await this.restaurantRepository.count({
      where: { isExternal: true, externalSource: 'kakao' },
    });

    // 외부 맛집이 없거나 10개 미만이면 동기화 필요
    return externalRestaurantCount < 10;
  }

  /**
   * 마지막 동기화 시간 확인
   * @returns 마지막 동기화 시간
   */
  async getLastSyncTime(): Promise<Date | null> {
    const latestRestaurant = await this.restaurantRepository.findOne({
      where: { isExternal: true, externalSource: 'kakao' },
      order: { lastSyncedAt: 'DESC' },
    });

    return latestRestaurant?.lastSyncedAt || null;
  }
}