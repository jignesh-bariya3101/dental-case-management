import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingStatus } from '@prisma/client';

export class queryRequestInput {
  @ApiProperty({
    description: 'Filter by company name (case-insensitive)',
    example: 'Acme',
    required: false,
  })
  @IsString()
  @IsOptional()
  queryString?: string;

  @ApiProperty({
    description: 'MANUFACTURE or LAB',
    example: 'MANUFACTURE or LAB',
    required: false,
  })
  @IsString()
  @IsOptional()
  shipFrom?: string;

  @ApiProperty({
    description: 'MANUFACTURE or LAB',
    example: 'MANUFACTURE or LAB',
    required: false,
  })
  @IsString()
  @IsOptional()
  shipTo?: string;

  @ApiProperty({
    enum: ShippingStatus,
    description: 'Filter by Shipping status',
    isArray: true, // Specify that the property can be an array
    required: false,
  })
  @IsEnum(ShippingStatus, { each: true }) // Validate each element in the array
  @IsOptional()
  status?: ShippingStatus[]; // Update type to ShippingStatus[]

  @ApiProperty({
    example: 'fromTypeId',
    description: 'fromTypeId',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromTypeId: string;

  @ApiProperty({
    example: 'toTypeId',
    description: 'toTypeId',
    required: false,
  })
  @IsString()
  @IsOptional()
  toTypeId: string;

  @ApiProperty({
    example: 10,
    description: 'Limit the number of results per page',
    required: false,
  })
  @IsInt()
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsInt()
  @IsOptional()
  pageNo?: number = 1;

  @ApiProperty({
    description: 'Field Name for Order Set',
    example: 'createdAt, trackingNum',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiProperty({
    description: 'Order type asc/desc',
    example: 'asc',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderType?: string;
}
