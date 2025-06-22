import { Test, TestingModule } from '@nestjs/testing';
import { BaropotService } from './baropot.service';

describe('BaropotService', () => {
  let service: BaropotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaropotService],
    }).compile();

    service = module.get<BaropotService>(BaropotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
