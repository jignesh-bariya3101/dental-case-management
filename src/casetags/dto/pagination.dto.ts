import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryRequestInput {
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
}
