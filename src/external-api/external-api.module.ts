import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KakaoLocalService } from './kakao-local.service';
import { ExternalApiController } from './external-api.controller';
import { KakaoToRestaurantMapper } from './mapper/kakao-to-restaurant.mapper';
import { RestaurantSyncService } from './service/restaurant-sync.service';
import { Restaurant } from '../entities/restaurant/restaurant.entity';

@Module({
  imports: [
    ConfigModule, // 환경변수 사용을 위해 ConfigModule 가져오기
    TypeOrmModule.forFeature([Restaurant]), // Restaurant 엔티티 등록
  ],
  controllers: [ExternalApiController], // 테스트용 컨트롤러 등록
  providers: [
    KakaoLocalService,
    KakaoToRestaurantMapper,
    RestaurantSyncService,
  ],
  exports: [
    KakaoLocalService,
    RestaurantSyncService, // 다른 모듈에서 동기화 서비스 사용 가능
  ],
})
export class ExternalApiModule {}