// pagination.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CaseStatus } from '@prisma/client';

export class queryRequestInput {
  @ApiProperty({
    enum: CaseStatus,
    description: 'Filter by Shipping status',
    isArray: true, // Specify that the property can be an array
    required: false,
  })
  @IsEnum(CaseStatus, { each: true }) // Validate each element in the array
  @IsOptional()
  status?: CaseStatus[]; // Update type to CaseStatus[]

  @IsOptional()
  flag?: Array<string>;

  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNo?: number;

  @ApiProperty({
    example: 'shippingFlagtimeStamp',
    required: false,
  })
  @IsOptional()
  shippingFlagtimeStamp?: boolean;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    example: 'searchQuery',
    description: 'Query string for searching',
    required: false,
  })
  @IsOptional()
  @IsString()
  queryString?: string;

  @ApiProperty({
    example: 'Dentist Id',
    description: 'Case list based on Dentist',
    required: false,
  })
  @IsOptional()
  @IsString()
  dentistId?: string;

  @ApiProperty({
    example: 'Manufacture Id',
    description: 'Case list based on Manufacture',
    required: false,
  })
  @IsOptional()
  @IsString()
  manufactureId?: string;

  @ApiProperty({
    description: 'Field Name for Order Set',
    example: 'createdAt, updatedAt',
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

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}

export class queryRemakeCaseRequestInput {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNo?: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    example: 'searchQuery',
    description: 'Query string for searching',
    required: false,
  })
  @IsOptional()
  @IsString()
  queryString?: string;

  @ApiProperty({
    description: 'Field Name for Order Set',
    example: 'createdAt, updatedAt',
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

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}

export class getPatientDto {
  @ApiProperty({ example: 'Test', description: 'firstName' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Test', description: 'lastName' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '5asfd5esFsdF', description: 'ewgefE4' })
  @IsString()
  dentistId: string;
}

export class queryRequestInputExport {
  @ApiProperty({
    enum: CaseStatus,
    description: 'Filter by Shipping status',
    isArray: true, // Specify that the property can be an array
    required: false,
  })
  @IsEnum(CaseStatus, { each: true }) // Validate each element in the array
  @IsOptional()
  status?: CaseStatus[]; // Update type to CaseStatus[]

  @ApiProperty({
    example: 'searchQuery',
    description: 'Query string for searching',
    required: false,
  })
  @IsOptional()
  @IsString()
  queryString?: string;

  @ApiProperty({
    example: 'Dentist Id',
    description: 'Case list based on Dentist',
    required: false,
  })
  @IsOptional()
  @IsString()
  dentistId?: string;

  @ApiProperty({
    example: 'Manufacture Id',
    description: 'Case list based on Manufacture',
    required: false,
  })
  @IsOptional()
  @IsString()
  manufactureId?: string;

  @ApiProperty({
    description: 'Field Name for Order Set',
    example: 'createdAt, updatedAt',
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

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-05-31 07:47:19.659',
    required: false,
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}
