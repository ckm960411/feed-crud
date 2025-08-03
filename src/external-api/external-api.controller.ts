import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { KakaoLocalService } from './kakao-local.service';
import {
  RestaurantSyncService,
  SyncResult,
} from './service/restaurant-sync.service';
import { KakaoSearchResponse } from '../types/kakao-api.interface';

@ApiTags('외부 API 테스트')
@Controller('external-api')
export class ExternalApiController {
  constructor(
    private readonly kakaoLocalService: KakaoLocalService,
    private readonly restaurantSyncService: RestaurantSyncService,
  ) {}

  @ApiOperation({
    summary: '카카오 맛집 검색 테스트',
    description: '카카오 로컬 API를 사용하여 맛집을 검색합니다. (테스트용)',
  })
  @ApiQuery({
    name: 'query',
    description: '검색할 맛집 키워드',
    example: '강남 맛집',
  })
  @ApiQuery({
    name: 'lat',
    description: '위도 (선택사항)',
    example: 37.497175,
    required: false,
  })
  @ApiQuery({
    name: 'lng',
    description: '경도 (선택사항)',
    example: 127.027926,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '카카오 맛집 검색 성공',
    type: Object,
  })
  @Get('kakao/restaurants')
  async searchKakaoRestaurants(
    @Query('query') query: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ): Promise<KakaoSearchResponse> {
    const location = lat && lng ? { lat, lng } : undefined;
    return this.kakaoLocalService.searchRestaurants(query, location);
  }

  @ApiOperation({
    summary: '카카오 API 상태 확인',
    description: '카카오 API 연결 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'API 상태 확인 성공',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        service: { type: 'string', example: 'Kakao Local API' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @Get('kakao/health')
  async checkKakaoHealth() {
    // 간단한 검색으로 API 연결 테스트
    try {
      await this.kakaoLocalService.searchRestaurants('테스트');
      return {
        status: 'OK',
        service: 'Kakao Local API',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'ERROR',
        service: 'Kakao Local API',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @ApiOperation({
    summary: '인기 맛집 데이터 동기화',
    description:
      '카카오 API에서 인기 맛집 데이터를 가져와서 내부 DB에 저장합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '동기화 성공',
    schema: {
      type: 'object',
      properties: {
        totalFetched: { type: 'number', example: 45 },
        newRestaurants: { type: 'number', example: 30 },
        updatedRestaurants: { type: 'number', example: 10 },
        skippedRestaurants: { type: 'number', example: 5 },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @Post('sync/popular-restaurants')
  async syncPopularRestaurants(): Promise<SyncResult> {
    return this.restaurantSyncService.syncPopularRestaurants();
  }

  @ApiOperation({
    summary: '위치 기반 맛집 데이터 동기화',
    description: '특정 위치 주변의 맛집 데이터를 동기화합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lat: { type: 'number', example: 37.497175 },
        lng: { type: 'number', example: 127.027926 },
        radius: {
          type: 'number',
          example: 5000,
          description: '반경(미터), 기본값: 5000',
        },
      },
      required: ['lat', 'lng'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '위치 기반 동기화 성공',
  })
  @Post('sync/restaurants-by-location')
  async syncRestaurantsByLocation(
    @Body() body: { lat: number; lng: number; radius?: number },
  ): Promise<SyncResult> {
    const { lat, lng, radius = 5000 } = body;
    return this.restaurantSyncService.syncRestaurantsByLocation(
      { lat, lng },
      radius,
    );
  }

  @ApiOperation({
    summary: '동기화 상태 확인',
    description: '마지막 동기화 시간과 외부 맛집 개수를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '동기화 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        needsSync: { type: 'boolean', example: false },
        lastSyncTime: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        externalRestaurantCount: { type: 'number', example: 50 },
      },
    },
  })
  @Get('sync/status')
  async getSyncStatus() {
    const [needsSync, lastSyncTime] = await Promise.all([
      this.restaurantSyncService.needsSync(),
      this.restaurantSyncService.getLastSyncTime(),
    ]);

    return {
      needsSync,
      lastSyncTime,
      timestamp: new Date().toISOString(),
    };
  }
}
