import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/createShippingDto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { queryRequestInput } from './dto/pagination.dto';
import { AuthenticatedRequest } from 'src/middleware/AuthenticatedRequest.interface';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @ApiOperation({ summary: 'Add Shipping' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Shipping created successfully' })
  @ApiBody({ type: CreateShippingDto })
  async create(@Body() createShippingDto: CreateShippingDto) {
    try {
      return await this.shippingService.create(createShippingDto);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all shipping' })
  @ApiResponse({
    status: 200,
    description: 'Get all list of shipping',
  })
  async findAll(
    @Query() query: queryRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      console.info(req.user);
      return await this.shippingService.list(query);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get shipping details' })
  @ApiResponse({ status: 200, description: 'shipping details' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.shippingService.findOne(id);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
