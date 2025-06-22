import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Baropot } from 'src/entities/baropot/baropot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BaropotService {
  constructor(
    @InjectRepository(Baropot)
    private readonly baropotRepository: Repository<Baropot>,
  ) {}

  async findAllBaropots() {
    return this.baropotRepository.find({
      relations: {
        baropotParticipants: true,
        baropotToBaropotTags: {
          baropotTag: true,
        },
        restaurant: true,
      },
    });
  }
}
