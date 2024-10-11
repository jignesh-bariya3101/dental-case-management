import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleTypeController } from './schedule-type.controller';

describe('ScheduleTypeController', () => {
  let controller: ScheduleTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleTypeController],
    }).compile();

    controller = module.get<ScheduleTypeController>(ScheduleTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
