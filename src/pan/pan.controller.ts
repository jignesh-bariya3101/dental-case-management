import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PanService } from './pan.service';
import { queryRequestInput } from './dto/pagination.dto';
import { AuthenticatedRequest } from 'src/middleware/AuthenticatedRequest.interface';
import { CreatePanDto } from './dto/create-pan.dto';
import { UpdatePanDto } from './dto/update-pan.dto';

@ApiTags('Pan')
@Controller('pan')
export class PanController {
  constructor(private readonly panService: PanService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Pan' })
  @ApiResponse({ status: 200, description: 'Pan added successfully' })
  @ApiBody({ type: CreatePanDto })
  async create(
    @Body() createPanDto: CreatePanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.panService.create(createPanDto, req.user);
    } catch (error) {
      console.error('Error creating Pan:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Pan records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieve all Pan records',
  })
  async findAll(
    @Query() query: queryRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.panService.findAll(query, req.user);
    } catch (error) {
      console.error('Error retrieving Pan records:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Pan details' })
  @ApiResponse({ status: 200, description: 'Pan details' })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      return await this.panService.findOne(id, req.user);
    } catch (error) {
      console.error('Error retrieving Pan:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Pan' })
  @ApiResponse({ status: 200, description: 'Pan updated successfully' })
  @ApiBody({ type: UpdatePanDto })
  async update(
    @Param('id') id: string,
    @Body() updatePanDto: UpdatePanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.panService.update(id, updatePanDto, req.user);
    } catch (error) {
      console.error('Error updating Pan:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
