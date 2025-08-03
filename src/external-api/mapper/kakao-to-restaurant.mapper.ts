import { Injectable } from '@nestjs/common';
import { KakaoPlace } from '../../types/kakao-api.interface';
import { Restaurant } from '../../entities/restaurant/restaurant.entity';
import { RestaurantCategory } from '../../types/enum/restaurant-category.enum';

@Injectable()
export class KakaoToRestaurantMapper {
  /**
   * 카카오 장소 데이터를 Restaurant 엔티티로 변환
   * @param kakaoPlace 카카오 API에서 받은 장소 데이터
   * @returns Restaurant 엔티티 (저장 전 상태)
   */
  mapToRestaurant(kakaoPlace: KakaoPlace): Partial<Restaurant> {
    return {
      // 기본 정보
      name: kakaoPlace.place_name,
      category: this.mapCategory(kakaoPlace.category_name),
      address: kakaoPlace.road_address_name || kakaoPlace.address_name,
      lat: parseFloat(kakaoPlace.y), // 카카오에서는 y가 위도
      lng: parseFloat(kakaoPlace.x), // 카카오에서는 x가 경도
      description: this.generateDescription(kakaoPlace),
      phoneNumber: this.normalizePhoneNumber(kakaoPlace.phone),
      
      // 영업시간 (카카오 API에서 제공하지 않으므로 기본값 설정)
      openingTime: '09:00',
      closingTime: '22:00',
      lastOrderTime: '21:30',
      
      // 외부 데이터 관련 필드
      isExternal: true,
      externalSource: 'kakao',
      externalId: kakaoPlace.id,
      lastSyncedAt: new Date(),
      
      // 사용자는 null (외부 데이터이므로)
      user: null,
    };
  }

  /**
   * 카카오 카테고리명을 내부 RestaurantCategory로 매핑
   * @param categoryName 카카오 카테고리명 (예: "음식점 > 한식 > 갈비집")
   * @returns RestaurantCategory enum 값
   */
  private mapCategory(categoryName: string): RestaurantCategory {
    if (!categoryName) return RestaurantCategory.FUSION;

    const lowerCategory = categoryName.toLowerCase();

    // 한식 관련 키워드
    if (lowerCategory.includes('한식') || 
        lowerCategory.includes('갈비') || 
        lowerCategory.includes('삼겹살') ||
        lowerCategory.includes('김치') ||
        lowerCategory.includes('불고기')) {
      return RestaurantCategory.KOREAN;
    }

    // 일식 관련 키워드
    if (lowerCategory.includes('일식') || 
        lowerCategory.includes('초밥') || 
        lowerCategory.includes('라멘') ||
        lowerCategory.includes('우동') ||
        lowerCategory.includes('일본')) {
      return RestaurantCategory.JAPANESE;
    }

    // 중식 관련 키워드
    if (lowerCategory.includes('중식') || 
        lowerCategory.includes('짜장') || 
        lowerCategory.includes('짬뽕') ||
        lowerCategory.includes('중국')) {
      return RestaurantCategory.CHINESE;
    }

    // 양식 관련 키워드
    if (lowerCategory.includes('양식') || 
        lowerCategory.includes('이탈리안') || 
        lowerCategory.includes('파스타') ||
        lowerCategory.includes('피자') ||
        lowerCategory.includes('스테이크')) {
      return RestaurantCategory.WESTERN;
    }

    // 카페 관련 키워드
    if (lowerCategory.includes('카페') || 
        lowerCategory.includes('커피') || 
        lowerCategory.includes('cafe')) {
      return RestaurantCategory.CAFE;
    }

    // 패스트푸드 관련 키워드
    if (lowerCategory.includes('패스트푸드') || 
        lowerCategory.includes('햄버거') || 
        lowerCategory.includes('치킨')) {
      return RestaurantCategory.FAST_FOOD;
    }

    // 바/술집 관련 키워드
    if (lowerCategory.includes('술집') || 
        lowerCategory.includes('바') || 
        lowerCategory.includes('bar') ||
        lowerCategory.includes('주점')) {
      return RestaurantCategory.BAR;
    }

    // 기본값: 퓨전
    return RestaurantCategory.FUSION;
  }

  /**
   * 카카오 장소 정보를 기반으로 설명 생성
   * @param kakaoPlace 카카오 장소 데이터
   * @returns 생성된 설명
   */
  private generateDescription(kakaoPlace: KakaoPlace): string {
    const address = kakaoPlace.road_address_name || kakaoPlace.address_name;
    return `${kakaoPlace.place_name}은(는) ${address}에 위치한 맛집입니다. (카카오맵 제공)`;
  }

  /**
   * 전화번호 정규화 (하이픈 제거)
   * @param phone 카카오에서 받은 전화번호
   * @returns 정규화된 전화번호
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // 하이픈, 공백, 괄호 제거
    return phone.replace(/[-\s()]/g, '');
  }

  /**
   * 카카오 장소 배열을 Restaurant 엔티티 배열로 변환
   * @param kakaoPlaces 카카오 장소 배열
   * @returns Restaurant 엔티티 배열
   */
  mapToRestaurants(kakaoPlaces: KakaoPlace[]): Partial<Restaurant>[] {
    return kakaoPlaces.map(place => this.mapToRestaurant(place));
  }
}