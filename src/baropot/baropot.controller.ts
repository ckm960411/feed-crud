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
import { CreateBaropotService } from './service/create-baropot.service';
import { UpdateBaropotService } from './service/update-baropot.service';
import { ParticipateBaropotService } from './service/participate-baropot.service';
import { ParticipateBaropotReqDto } from './dto/request/participate-baropot.req.dto';
import { HandleParticipantRequestReqDto } from './dto/request/handle-participant-request.req.dto';
import { UpdateBaropotStatusService } from './service/update-baropot-status.service';
import { UpdateBaropotStatusReqDto } from './dto/request/update-baropot-status.req.dto';
import { FindBaropotService } from './service/find-baropot.service';

@ApiTags('바로팟')
@Controller('baropots')
export class BaropotController {
  constructor(
    private readonly findBaropotService: FindBaropotService,
    private readonly createBaropotService: CreateBaropotService,
    private readonly updateBaropotService: UpdateBaropotService,
    private readonly participateBaropotService: ParticipateBaropotService,
    private readonly updateBaropotStatusService: UpdateBaropotStatusService,
  ) {}

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
    return this.findBaropotService.findAllBaropots({
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
    return this.findBaropotService.findBaropotById(baropotId);
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
    return this.createBaropotService.createBaropot({
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
    return this.updateBaropotService.updateBaropot({ baropotId, dto, userId });
  }

  @ApiOperation({
    summary: '바로팟 참가 요청',
    description: '바로팟에 참가 요청을 합니다.',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: ParticipateBaropotReqDto,
    description: '바로팟 참가 요청 요청 데이터 (ParticipateBaropotReqDto)',
  })
  @ApiResponse({
    status: 201,
    description: '바로팟 참가 요청 성공 (boolean)',
    type: Boolean,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':baropotId/participants')
  async participateBaropot(
    @Param('baropotId') baropotId: number,
    @User('id') userId: number,
    @Body() dto: ParticipateBaropotReqDto,
  ) {
    return this.participateBaropotService.participateBaropot({
      baropotId,
      userId,
      dto,
    });
  }

  @ApiOperation({
    summary: '바로팟 참가 요청 처리',
    description: '바로팟 참가 요청을 승인하거나 거절합니다.',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: HandleParticipantRequestReqDto,
    description:
      '바로팟 참가 요청 처리 요청 데이터 (HandleParticipantRequestReqDto)',
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 참가 요청 처리 성공 (boolean)',
    type: Boolean,
  })
  @Patch(':baropotId/participants')
  @UseGuards(JwtAuthGuard)
  async handleParticipantJoinRequest(
    @Param('baropotId') baropotId: number,
    @User('id') userId: number,
    @Body() dto: HandleParticipantRequestReqDto,
  ) {
    return this.participateBaropotService.handleParticipantJoinRequest({
      baropotId,
      userId,
      dto,
    });
  }

  @ApiOperation({
    summary: '바로팟 참가 취소',
    description: '바로팟 참가를 취소합니다.',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 참가 취소 성공 (boolean)',
    type: Boolean,
  })
  @Delete(':baropotId/participants')
  @UseGuards(JwtAuthGuard)
  async cancelParticipantJoinRequest(
    @Param('baropotId') baropotId: number,
    @User('id') userId: number,
  ) {
    return this.participateBaropotService.cancelParticipantJoinRequest({
      baropotId,
      userId,
    });
  }

  @ApiOperation({
    summary: '바로팟 상태 변경',
    description: '바로팟 상태를 변경합니다.',
  })
  @ApiParam({
    name: 'baropotId',
    description: '바로팟 ID',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: UpdateBaropotStatusReqDto,
    description: '바로팟 상태 변경 요청 데이터 (UpdateBaropotStatusReqDto)',
  })
  @ApiResponse({
    status: 200,
    description: '바로팟 상태 변경 성공 (boolean)',
    type: Boolean,
  })
  @Patch(':baropotId/status')
  @UseGuards(JwtAuthGuard)
  async updateBaropotStatus(
    @Param('baropotId') baropotId: number,
    @User('id') userId: number,
    @Body() dto: UpdateBaropotStatusReqDto,
  ) {
    return this.updateBaropotStatusService.updateBaropotStatus({
      baropotId,
      userId,
      dto,
    });
  }
}
