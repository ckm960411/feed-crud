import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BaropotService } from './baropot.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateBaropotReqDto } from './dto/request/create-baropot.req.dto';
import { FindBaropotResDto } from './dto/response/find-baropot.res.dto';

@ApiTags('바로팟')
@Controller('baropots')
export class BaropotController {
  constructor(private readonly baropotService: BaropotService) {}

  // TODO: 응답 타입 정의
  @ApiOperation({
    summary: '바로팟 조회',
    description: '바로팟 목록을 조회합니다.',
  })
  @Get()
  async findAllBaropots() {
    return this.baropotService.findAllBaropots();
  }

  @ApiOperation({
    summary: '바로팟 상세 조회',
    description: '바로팟 상세 정보를 조회합니다. (응답: FindBaropotResDto)',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 상세 정보 (FindBaropotResDto)',
    type: FindBaropotResDto,
  })
  @Get(':baropotId')
  async findBaropotById(@Param('baropotId') baropotId: number) {
    return this.baropotService.findBaropotById(baropotId);
  }

  // TODO: 응답 타입 정의
  @ApiOperation({
    summary: '바로팟 등록',
    description: '바로팟을 생성합니다.',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBaropot(
    @Body() dto: CreateBaropotReqDto,
    @User('id') userId: number,
  ) {
    return this.baropotService.createBaropot({
      userId,
      dto,
    });
  }
}
