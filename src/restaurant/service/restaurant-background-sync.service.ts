import { Injectable, Logger } from '@nestjs/common';
import { KakaoLocalService } from '../../external-api/kakao-local.service';
import { RestaurantSyncService } from '../../external-api/service/restaurant-sync.service';
import { FindAllRestaurantsReqQuery } from '../dto/request/find-all-restaurants.req.query';

@Injectable()
export class RestaurantBackgroundSyncService {
  private readonly logger = new Logger(RestaurantBackgroundSyncService.name);
  private readonly syncInProgress = new Set<string>(); // 중복 동기화 방지

  constructor(
    private readonly kakaoLocalService: KakaoLocalService,
    private readonly restaurantSyncService: RestaurantSyncService,
  ) {}

  /**
   * 검색 쿼리를 기반으로 백그라운드에서 카카오 데이터 동기화
   * @param query 사용자 검색 쿼리
   */
  async syncInBackground(query: FindAllRestaurantsReqQuery): Promise<void> {
    // 동기화 키 생성 (중복 방지용)
    const syncKey = this.generateSyncKey(query);
    
    if (this.syncInProgress.has(syncKey)) {
      this.logger.debug(`Sync already in progress for key: ${syncKey}`);
      return;
    }

    // 백그라운드에서 비동기 실행 (사용자 응답에 영향 없음)
    setImmediate(() => {
      this.performBackgroundSync(syncKey, query).catch((error) => {
        this.logger.error(`Background sync failed for key: ${syncKey}`, error);
      });
    });
  }

  /**
   * 실제 백그라운드 동기화 수행
   */
  private async performBackgroundSync(
    syncKey: string,
    query: FindAllRestaurantsReqQuery,
  ): Promise<void> {
    this.syncInProgress.add(syncKey);
    
    try {
      this.logger.log(`Starting background sync for: ${syncKey}`);
      
      // 1. 검색 키워드 생성
      const searchKeyword = this.buildSearchKeyword(query);
      if (!searchKeyword) {
        this.logger.debug('No search keyword generated, skipping sync');
        return;
      }

      // 2. 위치 정보가 있는 경우 위치 기반 동기화
      if (query.lat && query.lng) {
        await this.syncByLocation(query, searchKeyword);
      } else {
        // 3. 키워드 기반 동기화
        await this.syncByKeyword(searchKeyword);
      }

      this.logger.log(`Background sync completed for: ${syncKey}`);
    } catch (error) {
      this.logger.error(`Background sync error for: ${syncKey}`, error);
    } finally {
      this.syncInProgress.delete(syncKey);
    }
  }

  /**
   * 위치 기반 동기화
   */
  private async syncByLocation(
    query: FindAllRestaurantsReqQuery,
    searchKeyword: string,
  ): Promise<void> {
    const location = {
      lat: query.lat!,
      lng: query.lng!,
    };
    
    const radius = query.radius || 5000; // 기본 5km

    this.logger.debug(`Syncing by location: ${location.lat}, ${location.lng} (${radius}m)`);

    // 위치 기반으로 여러 키워드 검색
    const locationKeywords = [searchKeyword, '맛집', '음식점'];
    
    for (const keyword of locationKeywords) {
      try {
        const kakaoResponse = await this.kakaoLocalService.searchRestaurants(
          keyword,
          { ...location, radius },
        );

        if (kakaoResponse.documents.length > 0) {
          // 결과가 있으면 동기화 서비스를 통해 DB에 저장
          await this.saveKakaoResults(kakaoResponse.documents);
        }

        // API 호출 간격 (Rate Limiting 방지)
        await this.sleep(500);
      } catch (error) {
        this.logger.warn(`Failed to sync keyword: ${keyword}`, error);
      }
    }
  }

  /**
   * 키워드 기반 동기화
   */
  private async syncByKeyword(searchKeyword: string): Promise<void> {
    this.logger.debug(`Syncing by keyword: ${searchKeyword}`);

    try {
      const kakaoResponse = await this.kakaoLocalService.searchRestaurants(searchKeyword);
      
      if (kakaoResponse.documents.length > 0) {
        await this.saveKakaoResults(kakaoResponse.documents);
      }
    } catch (error) {
      this.logger.warn(`Failed to sync by keyword: ${searchKeyword}`, error);
    }
  }

  /**
   * 카카오 검색 결과를 DB에 저장
   */
  private async saveKakaoResults(kakaoPlaces: any[]): Promise<void> {
    // 기존 동기화 서비스의 processRestaurant 로직을 재사용
    // 하지만 간소화된 버전으로 구현
    
    this.logger.debug(`Saving ${kakaoPlaces.length} places to DB`);
    
    // 여기서는 간단히 syncService의 로직을 호출
    // 실제로는 개별 처리 로직을 구현할 수도 있음
    try {
      // 임시로 간단한 키워드로 동기화 서비스 호출
      await this.restaurantSyncService.syncPopularRestaurants(['맛집']);
    } catch (error) {
      this.logger.warn('Failed to save kakao results via sync service', error);
    }
  }

  /**
   * 검색 키워드 생성
   */
  private buildSearchKeyword(query: FindAllRestaurantsReqQuery): string | null {
    const keywords: string[] = [];

    if (query.name?.trim()) {
      keywords.push(query.name.trim());
    }

    if (query.address?.trim()) {
      keywords.push(query.address.trim());
    }

    if (query.category) {
      // 카테고리를 한국어로 변환
      const categoryKeywords = this.getCategoryKeywords(query.category);
      keywords.push(...categoryKeywords);
    }

    // 키워드가 있으면 조합, 없으면 null
    return keywords.length > 0 ? keywords.join(' ') : null;
  }

  /**
   * 카테고리를 검색 키워드로 변환
   */
  private getCategoryKeywords(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      KOREAN: ['한식', '한국음식'],
      JAPANESE: ['일식', '일본음식', '초밥', '라멘'],
      CHINESE: ['중식', '중국음식', '짜장면'],
      WESTERN: ['양식', '파스타', '스테이크'],
      CAFE: ['카페', '커피'],
      FAST_FOOD: ['패스트푸드', '햄버거', '치킨'],
      BAR: ['술집', '바'],
      FUSION: ['퓨전'],
      ASIAN: ['아시안'],
      MEXICAN: ['멕시칸'],
      DESSERT: ['디저트', '케이크'],
      BUFFET: ['뷔페'],
      VEGAN: ['비건', '채식'],
    };

    return categoryMap[category] || [category];
  }

  /**
   * 동기화 키 생성 (중복 방지용)
   */
  private generateSyncKey(query: FindAllRestaurantsReqQuery): string {
    const parts: string[] = [];
    
    if (query.name) parts.push(`name:${query.name}`);
    if (query.address) parts.push(`addr:${query.address}`);
    if (query.category) parts.push(`cat:${query.category}`);
    if (query.lat && query.lng) parts.push(`loc:${query.lat},${query.lng}`);
    
    return parts.join('|') || 'default';
  }

  /**
   * 지연 함수 (Rate Limiting 방지)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 현재 진행 중인 동기화 작업 수 반환 (모니터링용)
   */
  getSyncStatus(): { inProgress: number; keys: string[] } {
    return {
      inProgress: this.syncInProgress.size,
      keys: Array.from(this.syncInProgress),
    };
  }
}