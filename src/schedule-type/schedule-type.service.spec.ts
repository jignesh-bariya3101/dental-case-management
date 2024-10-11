import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleTypeService } from './schedule-type.service';

describe('ScheduleTypeService', () => {
  let service: ScheduleTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleTypeService],
    }).compile();

    service = module.get<ScheduleTypeService>(ScheduleTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
