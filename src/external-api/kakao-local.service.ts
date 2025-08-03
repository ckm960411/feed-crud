import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  KakaoSearchResponse,
  KakaoSearchParams,
  KAKAO_FOOD_CATEGORIES,
} from '../types/kakao-api.interface';

@Injectable()
export class KakaoLocalService {
  private readonly logger = new Logger(KakaoLocalService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    
    if (!this.apiKey) {
      throw new Error('KAKAO_REST_API_KEY is not configured');
    }

    // Axios 인스턴스 생성 및 기본 설정
    this.axiosInstance = axios.create({
      baseURL: 'https://dapi.kakao.com',
      timeout: 10000, // 10초 타임아웃
      headers: {
        'Authorization': `KakaoAK ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('KakaoLocalService initialized');
  }

  /**
   * 키워드로 맛집 검색
   * @param params 검색 파라미터
   * @returns 카카오 API 응답
   */
  async searchPlaces(params: KakaoSearchParams): Promise<KakaoSearchResponse> {
    try {
      this.logger.log(`Searching places with query: ${params.query}`);
      
      const response = await this.axiosInstance.get<KakaoSearchResponse>(
        '/v2/local/search/keyword.json',
        { params }
      );

      this.logger.log(`Found ${response.data.documents.length} places`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to search places from Kakao API', error);
      throw new Error(`카카오 API 호출 실패: ${error.message}`);
    }
  }

  /**
   * 음식점만 검색 (카테고리 필터링 적용)
   * @param query 검색 키워드
   * @param location 위치 정보 (선택사항)
   * @returns 음식점 검색 결과
   */
  async searchRestaurants(
    query: string,
    location?: { lat: number; lng: number; radius?: number }
  ): Promise<KakaoSearchResponse> {
    const searchParams: KakaoSearchParams = {
      query: `${query} 맛집`, // 맛집 키워드 추가로 더 정확한 검색
      category_group_code: KAKAO_FOOD_CATEGORIES.KOREAN, // 음식점 카테고리로 필터링
      size: 15, // 최대 결과 수
      sort: location ? 'distance' : 'accuracy', // 위치가 있으면 거리순, 없으면 정확도순
    };

    // 위치 정보가 있으면 추가
    if (location) {
      searchParams.x = location.lng;
      searchParams.y = location.lat;
      if (location.radius) {
        searchParams.radius = Math.min(location.radius, 20000); // 최대 20km
      }
    }

    return this.searchPlaces(searchParams);
  }
}