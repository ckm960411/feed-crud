import { Module } from '@nestjs/common';
import { BaropotController } from './baropot.controller';
import { BaropotService } from './baropot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { BaropotParticipant } from 'src/entities/baropot/baropot-participant.entity';
import { BaropotTag } from 'src/entities/baropot/baropot-tag.entity';
import { BaropotToBaropotTag } from 'src/entities/baropot/baropot-to-baropot-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Baropot,
      BaropotParticipant,
      BaropotTag,
      BaropotToBaropotTag,
    ]),
  ],
  controllers: [BaropotController],
  providers: [BaropotService],
})
export class BaropotModule {}
