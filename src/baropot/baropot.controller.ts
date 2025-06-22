import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaropotService } from './baropot.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateBaropotReqDto } from './dto/request/create-baropot.req.dto';
import { FindBaropotResDto } from './dto/response/find-baropot.res.dto';
import { UpdateBaropotReqDto } from './dto/request/update-baropot.req.dto';
import { OptionalJwtAuthGuard } from 'src/auth/strategies/optional-jwt-auth.guard';
import { FindAllBaropotReqQuery } from './dto/request/find-all-baropot.req.query';

@ApiTags('바로팟')
@Controller('baropots')
export class BaropotController {
  constructor(private readonly baropotService: BaropotService) {}

  @ApiOperation({
    summary: '바로팟 목록 조회',
    description: '바로팟 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 목록 조회 성공 (FindBaropotResDto[])',
    type: [FindBaropotResDto],
  })
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAllBaropots(@Query() query: FindAllBaropotReqQuery) {
    return this.baropotService.findAllBaropots({
      query,
    });
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

  @ApiOperation({
    summary: '바로팟 등록',
    description: '바로팟을 생성합니다.',
  })
  @ApiBody({
    type: CreateBaropotReqDto,
    description: '바로팟 생성 요청 데이터 (CreateBaropotReqDto)',
  })
  @ApiResponse({
    status: 201,
    description: '바로팟 생성 성공 (FindBaropotResDto)',
    type: FindBaropotResDto,
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

  @ApiOperation({
    summary: '바로팟 수정',
    description: '바로팟을 수정합니다.',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: UpdateBaropotReqDto,
    description: '바로팟 수정 요청 데이터 (UpdateBaropotReqDto)',
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 수정 성공 (FindBaropotResDto)',
    type: FindBaropotResDto,
  })
  @Patch(':baropotId')
  @UseGuards(JwtAuthGuard)
  async updateBaropot(
    @Param('baropotId') baropotId: number,
    @Body() dto: UpdateBaropotReqDto,
    @User('id') userId: number,
  ) {
    return this.baropotService.updateBaropot({ baropotId, dto, userId });
  }
}
