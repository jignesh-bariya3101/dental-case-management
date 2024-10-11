import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ScheduleTypeService } from './schedule-type.service';
import {
  CreateScheduleTypeDto,
  UpdateScheduleTypeDto,
  queryRequestInput,
} from './dto/schedule-type.dto';
import { AuthenticatedRequest } from 'src/middleware/AuthenticatedRequest.interface';
import { CreatePanDto, UpdatePanDto } from './dto/pan.dto';

@ApiTags('ScheduleType')
@Controller('schedule-type')
export class ScheduleTypeController {
  constructor(private readonly scheduleTypeService: ScheduleTypeService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Schedule Type' })
  @ApiResponse({ status: 200, description: 'Schedule Type added successfully' })
  @ApiBody({ type: CreateScheduleTypeDto })
  async create(
    @Body(ValidationPipe) createScheduleTypeDto: CreateScheduleTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      try {
        console.info('createScheduleTypeDto', createScheduleTypeDto);

        return await this.scheduleTypeService.create(
          createScheduleTypeDto,
          req.user,
        );
      } catch (error) {
        console.info('Error', error);
      }
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all Schedule Type' })
  @ApiResponse({
    status: 200,
    description: 'Get all list of Schedule Type',
  })
  async findAll(
    @Query() query: queryRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.scheduleTypeService.findAll(query, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/pan')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all panNumber' })
  @ApiResponse({
    status: 200,
    description: 'Get all list of Schedule Type',
  })
  async findAllPanNumber(
    @Query() query: queryRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.scheduleTypeService.findAllPanNumber(query, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/pan-create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Pan' })
  @ApiResponse({ status: 200, description: 'Pan added successfully' })
  @ApiBody({ type: CreatePanDto })
  async createpan(
    @Body() createPanDto: CreatePanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.scheduleTypeService.createpan(createPanDto, req.user);
    } catch (error) {
      console.error(error, 'error');

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/updatepan/:panId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Pan' })
  @ApiResponse({ status: 200, description: 'Pan updated successfully' })
  @ApiBody({ type: UpdatePanDto })
  async updatepan(
    @Param('panId') id: string,
    @Body() updatePanDto: UpdatePanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.scheduleTypeService.updatepan(
        id,
        updatePanDto,
        req.user,
      );
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get Schedule Type details' })
  @ApiResponse({ status: 200, description: 'Schedule Type details' })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      return await this.scheduleTypeService.findOne(id, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update Schedule Type' })
  @ApiResponse({
    status: 200,
    description: 'Schedule Type detail updated successfully',
  })
  @ApiBody({ type: UpdateScheduleTypeDto })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleTypeDto: UpdateScheduleTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.scheduleTypeService.update(
        id,
        updateScheduleTypeDto,
        req.user,
      );
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'remove Schedule Type' })
  @ApiResponse({ status: 200, description: 'Schedule Type removed' })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      return await this.scheduleTypeService.remove(id, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
