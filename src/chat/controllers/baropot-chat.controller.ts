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
    summary: '사용자의 바로팟 채팅방 목록 조회',
    description:
      '현재 사용자가 참여 중인 모든 바로팟 채팅방 목록을 조회합니다. (읽지 않은 메시지 수 포함)',
  })
  @ApiResponse({
    description: '사용자의 바로팟 채팅방 목록',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          baropotChatRoomId: {
            type: 'number',
            description: '바로팟 채팅방 ID',
            example: 1,
          },
          roomName: {
            type: 'string',
            description: '채팅방 이름',
            example: '맛있는 치킨 모임 채팅방',
          },
          baropotTitle: {
            type: 'string',
            description: '바로팟 제목',
            example: '맛있는 치킨 같이 먹어요!',
          },
          baropotId: {
            type: 'number',
            description: '바로팟 ID',
            example: 1,
          },
          unreadCount: {
            type: 'number',
            description: '읽지 않은 메시지 수',
            example: 3,
          },
          isHost: {
            type: 'boolean',
            description: '바로팟 호스트 여부',
            example: true,
          },
          joinedStatus: {
            type: 'string',
            description: '참여 상태',
            example: 'APPROVED',
          },
        },
      },
    },
  })
  @Get('/me')
  async getUserChatRooms(@User('id') userId: number) {
    return this.baropotChatService.getUserChatRooms(userId);
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
