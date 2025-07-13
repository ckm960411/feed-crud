import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaropotChatRoom } from '../../entities/baropot-chat-room.entity';
import { BaropotParticipant } from '../../entities/baropot/baropot-participant.entity';
import { User } from '../../entities/user.entity';
import { BaropotChatMessage } from '../schemas/baropot-chat-message.schema';
import { CreateBaropotChatReqDto } from '../dto/request/create-baropot-chat.req.dto';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';
import { FindOneBaropotChatResDto } from './dto/response/find-one-baropot-chat.res.dto';

@Injectable()
export class BaropotChatService {
  constructor(
    // PostgreSQL repositories
    @InjectRepository(Baropot)
    private baropotRepository: Repository<Baropot>,
    @InjectRepository(BaropotChatRoom)
    private baropotChatRoomRepository: Repository<BaropotChatRoom>,
    @InjectRepository(BaropotParticipant)
    private baropotParticipantRepository: Repository<BaropotParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    // MongoDB model
    @InjectModel(BaropotChatMessage.name)
    private baropotChatMessageModel: Model<BaropotChatMessage>,
  ) {}

  async createChatRoom({
    dto: { baropotId, name: chatRoomName },
    userId,
  }: {
    dto: CreateBaropotChatReqDto;
    userId: number;
  }) {
    const baropot = await this.baropotRepository.findOne({
      where: { id: baropotId },
    });

    if (!baropot) {
      throw new NotFoundException(
        `바로팟을 찾을 수 없습니다. (ID: ${baropotId})`,
      );
    }

    if (baropot.status !== BaropotStatus.OPEN) {
      throw new BadRequestException(
        '바로팟이 모집 상태가 아닌 경우 채팅방을 생성할 수 없습니다.',
      );
    }

    const baropotParticipant = await this.baropotParticipantRepository.findOne({
      where: {
        baropot: { id: baropotId },
        user: { id: userId },
      },
      relations: {
        user: true,
      },
    });

    if (!baropotParticipant) {
      throw new NotFoundException('바로팟 참여자를 찾을 수 없습니다.');
    }

    if (!baropotParticipant.isHost) {
      throw new ForbiddenException('바로팟 호스트가 아닙니다.');
    }

    const chatRoom = await this.baropotChatRoomRepository.findOne({
      where: {
        baropot: { id: baropotId },
      },
    });

    if (chatRoom) {
      throw new BadRequestException('이미 채팅방이 존재합니다.');
    }

    const newChatRoom = this.baropotChatRoomRepository.create({
      name: chatRoomName,
      baropot: { id: baropotId },
    });

    const savedChatRoom =
      await this.baropotChatRoomRepository.save(newChatRoom);

    return savedChatRoom.id;
  }

  async findChatRoom(baropotChatRoomId: number, userId: number) {
    const chatRoom = await this.baropotChatRoomRepository.findOne({
      where: { id: baropotChatRoomId },
      relations: {
        baropot: {
          baropotParticipants: {
            user: true,
          },
          restaurant: true,
        },
      },
    });

    if (!chatRoom) {
      throw new NotFoundException(
        `바로팟 채팅방을 찾을 수 없습니다. (ID: ${baropotChatRoomId})`,
      );
    }

    // userId가 제공된 경우 읽지 않은 메시지 수 추가
    const unreadCount = await this.getUnreadCount(chatRoom.id, userId);

    return new FindOneBaropotChatResDto(chatRoom, unreadCount);
  }

  // 읽지 않은 메시지 수 조회
  private async getUnreadCount(
    baropotChatRoomId: number,
    userId: number,
  ): Promise<number> {
    const unreadMessages = await this.baropotChatMessageModel.find({
      baropotChatRoomId,
      senderId: { $ne: userId }, // 자신이 보낸 메시지 제외
      'readBy.userId': { $ne: userId.toString() }, // 읽지 않은 메시지만
    });

    return unreadMessages.length;
  }

  // 사용자의 모든 채팅방 조회 (읽지 않은 메시지 수 포함)
}
