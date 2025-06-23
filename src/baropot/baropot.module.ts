import { Module } from '@nestjs/common';
import { BaropotController } from './baropot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotTag } from 'src/entities/baropot/baropot-tag.entity';
import { BaropotToBaropotTag } from 'src/entities/baropot/baropot-to-baropot-tag.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { FindBaropotService } from './dto/service/find-baropot.service';
import { CreateBaropotService } from './dto/service/create-baropot.service';
import { UpdateBaropotService } from './dto/service/update-baropot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Baropot,
      BaropotParticipant,
      BaropotTag,
      BaropotToBaropotTag,
    ]),
    NotificationModule,
  ],
  controllers: [BaropotController],
  providers: [FindBaropotService, CreateBaropotService, UpdateBaropotService],
})
export class BaropotModule {}
