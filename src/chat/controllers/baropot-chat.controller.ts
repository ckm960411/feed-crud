import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BaropotChatService } from '../services/baropot-chat.service';
import { User } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CreateBaropotChatReqDto } from '../dto/request/create-baropot-chat.req.dto';
import { FindOneBaropotChatResDto } from '../services/dto/response/find-one-baropot-chat.res.dto';

@ApiTags('바로팟 채팅')
@Controller('baropot-chat')
@UseGuards(JwtAuthGuard)
export class BaropotChatController {
  constructor(private readonly baropotChatService: BaropotChatService) {}

  @ApiOperation({
    summary: '바로팟 채팅방 생성',
    description: '바로팟 채팅방을 생성합니다.',
  })
  @ApiBody({
    type: CreateBaropotChatReqDto,
    description: '바로팟 채팅방 생성 요청 데이터 (CreateBaropotChatReqDto)',
  })
  @ApiResponse({
    type: Number,
    description: '생성된 바로팟 채팅방의 ID (BaropotChatRoom.id)',
  })
  @Post()
  async create(
    @User('id') userId: number,
    @Body() dto: CreateBaropotChatReqDto,
  ): Promise<number> {
    return this.baropotChatService.createChatRoom({
      dto,
      userId,
    });
  }

  @ApiOperation({
    summary: '바로팟 채팅방 조회',
    description: '바로팟 채팅방을 조회합니다. (읽지 않은 메시지 수 포함)',
  })
  @ApiParam({
    name: 'baropotChatRoomId',
    description: '바로팟 채팅방 ID',
  })
  @ApiResponse({
    description: '바로팟 채팅방 조회 응답 데이터 (FindOneBaropotChatResDto)',
    type: FindOneBaropotChatResDto,
  })
  @Get(':baropotChatRoomId')
  async find(
    @Param('baropotChatRoomId') baropotChatRoomId: number,
    @User('id') userId: number,
  ): Promise<FindOneBaropotChatResDto> {
    return this.baropotChatService.findChatRoom(baropotChatRoomId, userId);
  }
}
