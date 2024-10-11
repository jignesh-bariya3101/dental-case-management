import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

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
