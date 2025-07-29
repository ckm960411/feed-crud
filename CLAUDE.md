# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

### 기본 명령어
- `npm install` - 의존성 설치
- `npm run build` - 프로젝트 빌드
- `npm run start:dev` - 개발 서버 시작 (watch 모드)
- `npm run start:prod` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행 (자동 수정)
- `npm run format` - Prettier로 코드 포맷팅

### 테스트
- `npm run test` - 단위 테스트 실행
- `npm run test:watch` - 테스트 watch 모드
- `npm run test:cov` - 커버리지 포함 테스트 실행
- `npm run test:e2e` - E2E 테스트 실행

### Docker 개발
- `docker-compose up` - PostgreSQL 데이터베이스와 함께 애플리케이션 시작
- 애플리케이션 포트: 8000, 데이터베이스 포트: 5432

## 아키텍처 개요

실시간 채팅 기능을 포함한 음식점 공동주문 플랫폼 "바로고"의 NestJS 기반 백엔드 애플리케이션입니다.

### 주요 기술 스택
- **프레임워크**: NestJS with TypeScript
- **데이터베이스**: PostgreSQL (메인) + MongoDB (채팅 메시지)
- **인증**: JWT + Google/Kakao OAuth2
- **실시간 통신**: Socket.IO WebSocket 채팅
- **클라우드**: AWS S3 파일 업로드
- **API 문서**: Swagger (`/api`)

### 핵심 모듈 구조

#### 인증 (`src/auth/`)
- 24시간 JWT 토큰 기반 인증
- OAuth2 연동 (Google, Kakao)
- 커스텀 가드: `JwtAuthGuard`, `OptionalJwtAuthGuard`, `WsJwtAuthGuard`
- JWT에서 사용자 정보 추출하는 User 데코레이터

#### 바로팟 (`src/baropot/`)
- 공동주문 핵심 비즈니스 로직
- 전문화된 서비스 지향 아키텍처:
  - `CreateBaropotService` - 새 공동주문 생성
  - `FindBaropotService` - 조회 및 필터링
  - `ParticipateBaropotService` - 참여자 관리
  - `UpdateBaropotStatusService` - 상태 관리
- 참가 요청/승인 시스템을 통한 참여자 관리

#### 실시간 채팅 (`src/chat/`)
- WebSocket 네임스페이스: `/baropot-chat`
- MongoDB 메시지 영속화
- 이벤트: `JOIN_ROOM`, `LEAVE_ROOM`, `SEND_MESSAGE`, `MARK_AS_READ`
- WebSocket 연결 JWT 인증
- 룸 기반 메시징 (바로팟당 하나의 채팅방)

#### 음식점 관리 (`src/restaurant/`)
- 필터링/검색 기능을 포함한 음식점 목록
- 북마크 및 리뷰 시스템
- 예약 관리
- AWS S3를 통한 사진 업로드

### 데이터베이스 설계

#### PostgreSQL 엔티티
- `id`, `createdAt`, `updatedAt`을 포함한 Base 엔티티 패턴
- 바로팟 엔티티: `Baropot`, `BaropotParticipant`, `BaropotTag`
- 음식점 엔티티: `Restaurant`, `RestaurantReview`, `RestaurantReservation`
- 사용자 관리: `User`, `Notification`, `Coupon`

#### MongoDB 스키마
- `BaropotChatMessage` - 채팅 메시지 저장
- Mongoose를 통한 연결

### 주요 Enum 및 타입 (`src/types/enum/`)
- `BaropotStatus` - 공동주문 상태 (OPEN, CLOSED 등)
- `BaropotJoinedStatus` - 참여자 상태
- `RestaurantCategory` - 음식점 카테고리 분류
- `ParticipantAgeGroup`, `ParticipantGender` - 인구통계학적 정보

### 개발 패턴

#### 서비스 레이어 아키텍처
각 주요 기능은 모놀리식 서비스 대신 전문화된 서비스 클래스를 사용:
```
baropot/
├── service/
│   ├── create-baropot.service.ts
│   ├── find-baropot.service.ts
│   ├── participate-baropot.service.ts
│   └── update-baropot-status.service.ts
```

#### DTO 구조
요청/응답별로 구성:
```
dto/
├── request/
│   ├── create-*.req.dto.ts
│   └── find-*.req.query.ts
└── response/
    └── find-*.res.dto.ts
```

#### 인증 통합
- JWT에서 사용자 ID 추출을 위한 `@User('id')` 데코레이터 사용
- 보호된 엔드포인트를 위한 `JwtAuthGuard`
- 인증 선택적 엔드포인트를 위한 `OptionalJwtAuthGuard`

### 설정 참고사항
- `.env` 파일에서 환경 변수 로드
- TypeORM synchronize 활성화 (개발 모드)
- 전역 CORS 활성화
- whitelist 및 transform을 포함한 전역 유효성 검사 파이프
- 데코레이터에서 자동 생성되는 Swagger 문서

### 테스트
- 단위 테스트를 위한 Jest 설정 (`*.spec.ts`)
- `test/` 디렉토리의 E2E 테스트
- `coverage/` 디렉토리에 생성되는 커버리지 리포트