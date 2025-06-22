import { Controller } from '@nestjs/common';
import { BaropotService } from './baropot.service';

@Controller('baropot')
export class BaropotController {
  constructor(private readonly baropotService: BaropotService) {}
}
