import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ShadesService } from './shades.service';
import { CreateShadeDto } from './dto/create-shade.dto';
import { UpdateShadeDto } from './dto/update-shade.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryRequestInput } from './dto/pagination.dto';

@ApiTags('Shades')
@Controller('shades')
export class ShadesController {
  constructor(private readonly shadesService: ShadesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shade' })
  @ApiBody({ type: CreateShadeDto })
  @ApiResponse({ status: 200, description: 'Shade created successfully' })
  async create(@Body() createShadeDto: CreateShadeDto) {
    try {
      return await this.shadesService.create(createShadeDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all shades' })
  @ApiResponse({ status: 200, description: 'List of all shades' })
  async findAll(@Query() query: QueryRequestInput) {
    try {
      return await this.shadesService.findAll(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shade by ID' })
  @ApiResponse({ status: 200, description: 'Shade details' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.shadesService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shade by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateShadeDto: UpdateShadeDto,
  ) {
    try {
      return await this.shadesService.update(id, updateShadeDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shade by ID' })
  @ApiResponse({ status: 200, description: 'Shade deleted successfully' })
  async remove(@Param('id') id: string) {
    try {
      return await this.shadesService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
