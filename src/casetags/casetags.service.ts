import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCasetagDto } from './dto/create-casetag.dto';
import { UpdateCasetagDto } from './dto/update-casetag.dto';
import { QueryRequestInput } from './dto/pagination.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CasetagsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createCasetagDto: CreateCasetagDto) {
    return 'This action adds a new casetag';
  }

  async findAll(query: QueryRequestInput) {
    try {
      const { pageNo, limit } = query;
      const offset = (pageNo - 1) * +limit;

      const totalCount = await this.databaseService.caseTag.count({});

      const tags = await this.databaseService.caseTag.findMany({
        take: +limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;

      return {
        status: true,
        message: 'List of all tags.',
        data: {
          data: tags,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} casetag`;
  }

  update(id: number, updateCasetagDto: UpdateCasetagDto) {
    return `This action updates a #${id} casetag`;
  }

  remove(id: number) {
    return `This action removes a #${id} casetag`;
  }
}
