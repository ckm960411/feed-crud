import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('맛집')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

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
}
