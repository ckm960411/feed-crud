import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { BaropotChatGateway } from './gateways/baropot-chat.gateway';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      BaropotChatRoom,
      Baropot,
      BaropotParticipant,
      User,
    ]),
    MongooseModule.forFeature([
      { name: BaropotChatMessage.name, schema: BaropotChatMessageSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [BaropotChatController],
  providers: [BaropotChatService, BaropotChatGateway],
  exports: [BaropotChatService],
})
export class BaropotChatModule {}
