import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CasetagsService } from './casetags.service';
import { CreateCasetagDto } from './dto/create-casetag.dto';
import { UpdateCasetagDto } from './dto/update-casetag.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryRequestInput } from './dto/pagination.dto';
import { AuthenticatedRequest } from 'src/middleware/AuthenticatedRequest.interface';

@Controller('casetags')
export class CasetagsController {
  constructor(private readonly casetagsService: CasetagsService) {}

  // @Post()
  // create(@Body() createCasetagDto: CreateCasetagDto) {
  //   return this.casetagsService.create(createCasetagDto);
  // }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all case tags' })
  findAll(@Query() query: QueryRequestInput, @Req() req: AuthenticatedRequest) {
    try {
      return this.casetagsService.findAll(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.casetagsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCasetagDto: UpdateCasetagDto) {
  //   return this.casetagsService.update(+id, updateCasetagDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.casetagsService.remove(+id);
  // }
}
