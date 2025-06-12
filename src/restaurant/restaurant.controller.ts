import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { RegisterRestaurantReqDto } from './dto/request/register-restaurant.req.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { RegisterRestaurantResDto } from './dto/response/register-retaurant.res.dto';

@ApiTags('맛집')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({
    summary: '맛집 목록 조회',
    description: '맛집 목록을 조회합니다.',
  })
  @Get()
  async findAll() {
    return this.restaurantService.findAll();
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
