import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './service/restaurant.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { RegisterRestaurantReqDto } from './dto/request/register-restaurant.req.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { RegisterRestaurantResDto } from './dto/response/register-retaurant.res.dto';
import { FindAllRestaurantsResDto } from './dto/response/find-all-restaurants.res.dto';
import { OptionalJwtAuthGuard } from 'src/auth/strategies/optional-jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { FindOneRestaurantResDto } from './dto/response/find-one-restaurant.res.dto';
import { CreateRestaurantReviewReqDto } from './dto/request/create-review.req.dto';
import { RestaurantReviewService } from './service/restaurant-review.service';
import { FindReviewResponse } from './dto/response/find-review.response';
import { UpdateRestaurantReviewReqDto } from './dto/request/upate-restaurant-review.req.dto';
import { UpdateRestaurantReqDto } from './dto/request/update-restaurant.req.dto';
import { RestaurantBookmarkService } from './service/restaurant-bookmark.service';
import { FindAllRestaurantsReqQuery } from './dto/request/find-all-restaurants.req.query';
import { CreateRestaurantReservationReqDto } from './dto/request/create-restaurant-reservation.req.dto';
import { RestaurantReservationService } from './service/restaurant-reservation.service';
import { RestaurantReservationCompletionService } from './service/restaurant-reservation-completion.service';
import { RestaurantBackgroundSyncService } from './service/restaurant-background-sync.service';

@ApiTags('맛집')
@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly restaurantReviewService: RestaurantReviewService,
    private readonly restaurantBookmarkService: RestaurantBookmarkService,
    private readonly restaurantReservationService: RestaurantReservationService,
    private readonly restaurantReservationCompletionService: RestaurantReservationCompletionService,
    private readonly restaurantBackgroundSyncService: RestaurantBackgroundSyncService,
  ) {}

  @ApiOperation({
    summary: '맛집 목록 조회',
    description: '맛집 목록을 조회합니다.',
  })
  @ApiQuery({
    type: FindAllRestaurantsReqQuery,
  })
  @ApiResponse({
    status: 200,
    description: '맛집 목록 조회 성공',
    isArray: true,
    type: FindAllRestaurantsResDto,
  })
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @UserDecorator() user: User | null,
    @Query() query: FindAllRestaurantsReqQuery,
  ): Promise<FindAllRestaurantsResDto[]> {
    return this.restaurantService.findAll({ userId: user?.id, query });
  }

  @ApiOperation({
    summary: '맛집 목록 조회 V2 (카카오 API 연동)',
    description:
      '카카오 API로 실시간 데이터를 보강하여 맛집 목록을 조회합니다.',
  })
  @ApiQuery({
    type: FindAllRestaurantsReqQuery,
  })
  @ApiResponse({
    status: 200,
    description: '맛집 목록 조회 성공 (카카오 데이터 보강)',
    isArray: true,
    type: FindAllRestaurantsResDto,
  })
  @Get('v2')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllV2(
    @UserDecorator() user: User | null,
    @Query() query: FindAllRestaurantsReqQuery,
  ): Promise<FindAllRestaurantsResDto[]> {
    // 1. 카카오 API 데이터 동기화 완료까지 대기
    await this.restaurantBackgroundSyncService.syncInBackground(query);

    // 2. 동기화 완료 후 우리 DB에서 검색 결과 반환
    return this.restaurantService.findAll({ userId: user?.id, query });
  }

  @ApiOperation({
    summary: '백그라운드 동기화 상태 확인',
    description: '현재 진행 중인 백그라운드 동기화 작업 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '동기화 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        inProgress: { type: 'number', example: 2 },
        keys: {
          type: 'array',
          items: { type: 'string' },
          example: ['name:강남맛집', 'loc:37.5,127.0'],
        },
      },
    },
  })
  @Get('v2/sync-status')
  async getSyncStatus() {
    return this.restaurantBackgroundSyncService.getSyncStatus();
  }

  @ApiOperation({
    summary: '맛집 상세 조회',
    description: '맛집 상세 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 상세 조회 성공',
    type: FindOneRestaurantResDto,
  })
  @Get(':restaurantId')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('restaurantId') restaurantId: number,
    @UserDecorator() user: User | null,
  ): Promise<FindOneRestaurantResDto> {
    return this.restaurantService.findOne(restaurantId, user?.id);
  }

  @ApiOperation({
    summary: '맛집 등록',
    description: '바로고 DB에 맛집 정보를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '맛집 등록 성공',
    type: RegisterRestaurantResDto,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async register(
    @UserDecorator('id') userId: number,
    @Body() dto: RegisterRestaurantReqDto,
  ): Promise<RegisterRestaurantResDto> {
    return this.restaurantService.register(userId, dto);
  }

  @ApiOperation({
    summary: '맛집 수정',
    description: '맛집 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 수정 성공',
    type: FindOneRestaurantResDto,
  })
  @Patch(':restaurantId')
  @UseGuards(JwtAuthGuard)
  async update(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
    @Body() dto: UpdateRestaurantReqDto,
  ): Promise<FindOneRestaurantResDto> {
    return this.restaurantService.update({ userId, restaurantId, dto });
  }

  @ApiOperation({
    summary: '맛집 삭제',
    description: '맛집을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 삭제 성공',
    type: Boolean,
  })
  @Delete(':restaurantId')
  @UseGuards(JwtAuthGuard)
  async delete(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
  ): Promise<boolean> {
    return this.restaurantService.delete({ userId, restaurantId });
  }

  @ApiOperation({
    summary: '맛집 리뷰 목록 조회',
    description: '특정 맛집에 대한 리뷰 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 리뷰 목록 조회 성공',
    isArray: true,
    type: FindReviewResponse,
  })
  @Get(':restaurantId/reviews')
  async findAllReviewsByRestaurantId(
    @Param('restaurantId') restaurantId: number,
  ) {
    return this.restaurantReviewService.findAllReviewsByRestaurantId(
      restaurantId,
    );
  }

  @ApiOperation({
    summary: '맛집 리뷰 단건 조회',
    description: '특정 리뷰 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 리뷰 상세 조회 성공',
    type: FindReviewResponse,
  })
  @Get('/reviews/:reviewId')
  async findOneReviewById(@Param('reviewId') reviewId: number) {
    return this.restaurantReviewService.findOneReviewById(reviewId);
  }

  @ApiOperation({
    summary: '맛집 리뷰 등록',
    description: '특정 맛집에 대한 리뷰를 작성합니다.',
  })
  @Post(':restaurantId/reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
    @Body() dto: CreateRestaurantReviewReqDto,
  ) {
    return this.restaurantReviewService.createReview({
      userId,
      restaurantId,
      dto,
    });
  }

  @ApiOperation({
    summary: '맛집 리뷰 수정',
    description: '특정 리뷰를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 리뷰 수정 성공',
    type: FindReviewResponse,
  })
  @Patch('/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @UserDecorator('id') userId: number,
    @Param('reviewId') reviewId: number,
    @Body() dto: UpdateRestaurantReviewReqDto,
  ) {
    return this.restaurantReviewService.updateReview({
      userId,
      reviewId,
      dto,
    });
  }

  @ApiOperation({
    summary: '맛집 리뷰 삭제',
    description: '맛집 리뷰를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 리뷰 삭제 성공',
    type: Boolean,
  })
  @Delete('/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @UserDecorator('id') userId: number,
    @Param('reviewId') reviewId: number,
  ) {
    return this.restaurantReviewService.deleteReview({
      userId,
      reviewId,
    });
  }

  @ApiOperation({
    summary: '내 북마크 맛집 목록 조회',
    description: '내 북마크 맛집 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내 북마크 맛집 목록 조회 성공',
    isArray: true,
    type: FindAllRestaurantsResDto,
  })
  @Get('/me/bookmarks')
  @UseGuards(JwtAuthGuard)
  async findAllBookmarksByUserId(@UserDecorator('id') userId: number) {
    return this.restaurantBookmarkService.findAllBookmarksByUserId(userId);
  }

  @ApiOperation({
    summary: '맛집 찜하기',
    description: '특정 맛집을 찜합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '맛집 찜하기 성공',
    type: Boolean,
  })
  @Post(':restaurantId/bookmark')
  @UseGuards(JwtAuthGuard)
  async addBookmarkRestaurant(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
  ): Promise<boolean> {
    return this.restaurantBookmarkService.addBookmarkRestaurant({
      userId,
      restaurantId,
    });
  }

  @ApiOperation({
    summary: '맛집 찜 취소',
    description: '특정 맛집의 찜을 취소합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 찜 취소 성공',
    type: Boolean,
  })
  @Delete(':restaurantId/bookmark')
  @UseGuards(JwtAuthGuard)
  async deleteBookmarkRestaurant(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
  ): Promise<boolean> {
    return this.restaurantBookmarkService.deleteBookmarkRestaurant({
      userId,
      restaurantId,
    });
  }

  @ApiOperation({
    summary: '맛집 예약',
    description: '맛집을 예약합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '맛집 예약 성공',
  })
  @Post(':restaurantId/reservations')
  @UseGuards(JwtAuthGuard)
  async createRestaurantReservation(
    @UserDecorator('id') userId: number,
    @Param('restaurantId') restaurantId: number,
    @Body() dto: CreateRestaurantReservationReqDto,
  ) {
    return this.restaurantReservationService.createRestaurantReservation({
      userId,
      restaurantId,
      dto,
    });
  }

  @Post('/reservations/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '예약 완료 처리 (테스트용)',
    description: '수동으로 예약 완료 처리를 실행합니다. (개발/테스트용)',
  })
  async completeReservation() {
    await this.restaurantReservationCompletionService.manuallyCompleteExpiredReservations();
    return { message: '예약 완료 처리 작업이 실행되었습니다.' };
  }
}
