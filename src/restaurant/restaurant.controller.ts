import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './service/restaurant.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('맛집')
@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly restaurantReviewService: RestaurantReviewService,
  ) {}

  @ApiOperation({
    summary: '맛집 목록 조회',
    description: '맛집 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맛집 목록 조회 성공',
    isArray: true,
    type: FindAllRestaurantsResDto,
  })
  @Get()
  async findAll(): Promise<FindAllRestaurantsResDto[]> {
    return this.restaurantService.findAll();
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
}
