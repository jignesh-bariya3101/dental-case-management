import { Test, TestingModule } from '@nestjs/testing';
import { CasetagsService } from './casetags.service';

describe('CasetagsService', () => {
  let service: CasetagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CasetagsService],
    }).compile();

    service = module.get<CasetagsService>(CasetagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
