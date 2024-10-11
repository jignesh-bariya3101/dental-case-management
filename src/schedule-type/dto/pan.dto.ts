import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePanDto {
  @IsString()
  @ApiProperty({ description: 'Unique Pan number' })
  panNumber: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'Schedule Type ID associated with the Pan',
    required: false,
  })
  scheduleTypeId?: string;
}

export class UpdatePanDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Unique Pan number', required: false })
  panNumber?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'Schedule Type ID associated with the Pan',
    required: false,
  })
  scheduleTypeId?: string;
}
