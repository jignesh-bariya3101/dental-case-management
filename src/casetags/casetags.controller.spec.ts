import { Test, TestingModule } from '@nestjs/testing';
import { CasetagsController } from './casetags.controller';
import { CasetagsService } from './casetags.service';

describe('CasetagsController', () => {
  let controller: CasetagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasetagsController],
      providers: [CasetagsService],
    }).compile();

    controller = module.get<CasetagsController>(CasetagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
