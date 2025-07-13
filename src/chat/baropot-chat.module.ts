import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BaropotChatRoom } from '../entities/baropot-chat-room.entity';
import { BaropotParticipant } from '../entities/baropot/baropot-participant.entity';
import { User } from '../entities/user.entity';
import {
  BaropotChatMessage,
  BaropotChatMessageSchema,
} from './schemas/baropot-chat-message.schema';
import { BaropotChatService } from './services/baropot-chat.service';
import { BaropotChatController } from './controllers/baropot-chat.controller';
import { Baropot } from 'src/entities/baropot/baropot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaropotChatRoom,
      Baropot,
      BaropotParticipant,
      User,
    ]),
    MongooseModule.forFeature([
      { name: BaropotChatMessage.name, schema: BaropotChatMessageSchema },
    ]),
  ],
  controllers: [BaropotChatController],
  providers: [BaropotChatService],
  exports: [BaropotChatService],
})
export class BaropotChatModule {}
