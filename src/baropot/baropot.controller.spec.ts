import { Test, TestingModule } from '@nestjs/testing';
import { BaropotController } from './baropot.controller';

describe('BaropotController', () => {
  let controller: BaropotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaropotController],
    }).compile();

    controller = module.get<BaropotController>(BaropotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
