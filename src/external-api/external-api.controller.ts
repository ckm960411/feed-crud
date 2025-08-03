import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KakaoLocalService } from './kakao-local.service';
import { KakaoSearchResponse } from '../types/kakao-api.interface';

@ApiTags('외부 API 테스트')
@Controller('external-api')
export class ExternalApiController {
  constructor(private readonly kakaoLocalService: KakaoLocalService) {}

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
}