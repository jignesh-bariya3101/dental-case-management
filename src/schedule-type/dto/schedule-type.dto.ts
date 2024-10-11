import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleTypeDto {
  @ApiProperty({
    example: 'Standard Schedule',
    description: 'Name for Schedule Type',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 2,
    description: 'Days in transit to manufacturer',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'In transit to manufacturer must be an integer' })
  @Min(0, { message: 'In transit to manufacturer must be at least 0' })
  inTransitToManufacturer?: number;

  @ApiProperty({ example: 10, description: 'Days in lab', required: false })
  @IsOptional()
  @IsInt({ message: 'Days in lab must be an integer' })
  @Min(0, { message: 'Days in lab must be at least 0' })
  daysInLab?: number;

  @ApiProperty({
    example: 3,
    description: 'Days in transit to dental lab',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Transit to dental lab must be an integer' })
  @Min(0, { message: 'Transit to dental lab must be at least 0' })
  transitToDentalLab?: number;

  @ApiProperty({
    example: 4,
    description: 'Days in transit to client',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Transit to client must be an integer' })
  @Min(0, { message: 'Transit to client must be at least 0' })
  transitToClient?: number;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'Creation date of the user',
  })
  createdAt?: Date = new Date(); // Set default value to current date

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'Update date of the user',
  })
  updatedAt?: Date = new Date();
}

export class UpdateScheduleTypeDto {
  @ApiProperty({
    example: 'Standard Schedule',
    description: 'Name for Schedule Type',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 2,
    description: 'Days in transit to manufacturer',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'In transit to manufacturer must be an integer' })
  @Min(0, { message: 'In transit to manufacturer must be at least 0' })
  inTransitToManufacturer?: number;

  @ApiProperty({ example: 10, description: 'Days in lab', required: false })
  @IsOptional()
  @IsInt({ message: 'Days in lab must be an integer' })
  @Min(0, { message: 'Days in lab must be at least 0' })
  daysInLab?: number;

  @ApiProperty({
    example: 3,
    description: 'Days in transit to dental lab',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Transit to dental lab must be an integer' })
  @Min(0, { message: 'Transit to dental lab must be at least 0' })
  transitToDentalLab?: number;

  @ApiProperty({
    example: 4,
    description: 'Days in transit to client',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Transit to client must be an integer' })
  @Min(0, { message: 'Transit to client must be at least 0' })
  transitToClient?: number;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'Update date of the user',
  })
  updatedAt?: Date = new Date();
}

export class queryRequestInput {
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
    example: '',
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
}
