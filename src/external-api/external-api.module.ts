import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KakaoLocalService } from './kakao-local.service';
import { ExternalApiController } from './external-api.controller';

@Module({
  imports: [ConfigModule], // 환경변수 사용을 위해 ConfigModule 가져오기
  controllers: [ExternalApiController], // 테스트용 컨트롤러 등록
  providers: [KakaoLocalService], // KakaoLocalService를 프로바이더로 등록
  exports: [KakaoLocalService], // 다른 모듈에서 사용할 수 있도록 export
})
export class ExternalApiModule {}