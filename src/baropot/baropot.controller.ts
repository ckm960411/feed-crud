import { Controller, Get } from '@nestjs/common';
import { BaropotService } from './baropot.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('baropots')
export class BaropotController {
  constructor(private readonly baropotService: BaropotService) {}

  @ApiOperation({
    summary: '바로팟 조회',
    description: '바로팟 목록을 조회합니다.',
  })
  @Get()
  async findAllBaropots() {
    return this.baropotService.findAllBaropots();
  }
}
