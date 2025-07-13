import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BaropotChatService } from '../services/baropot-chat.service';
import { User } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { CreateBaropotChatReqDto } from '../dto/request/create-baropot-chat.req.dto';

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
}
