import { Test, TestingModule } from '@nestjs/testing';
import { ShadesService } from './shades.service';

describe('ShadesService', () => {
  let service: ShadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShadesService],
    }).compile();

    service = module.get<ShadesService>(ShadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
