import { Test, TestingModule } from '@nestjs/testing';
import { ShadesController } from './shades.controller';
import { ShadesService } from './shades.service';

describe('ShadesController', () => {
  let controller: ShadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShadesController],
      providers: [ShadesService],
    }).compile();

    controller = module.get<ShadesController>(ShadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
