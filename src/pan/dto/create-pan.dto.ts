import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateScheduleTypeDto {
  @ApiProperty({
    example: 'Standard Schedule',
    description: 'Name of the schedule type',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 2,
    description: 'Time in days for in-transit to manufacturer',
    required: false,
  })
  @IsOptional()
  inTransitToManufacturer?: number;

  @ApiProperty({
    example: 5,
    description: 'Number of days in the lab',
    required: false,
  })
  @IsOptional()
  daysInLab?: number;

  @ApiProperty({
    example: 1,
    description: 'Transit time in days to the dental lab',
    required: false,
  })
  @IsOptional()
  transitToDentalLab?: number;

  @ApiProperty({
    example: 3,
    description: 'Transit time in days to the client',
    required: false,
  })
  @IsOptional()
  transitToClient?: number;
}

export class CreatePanDto {
  @ApiProperty({
    example: 'ABCDE1234F',
    description: 'Unique PAN number',
  })
  @IsNotEmpty()
  @IsString()
  panNumber: string;

  @ApiProperty({
    example: 'existing-schedule-type-uuid',
    description: 'UUID of the existing schedule type',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  scheduleTypeId?: string;

  @ApiProperty({
    type: CreateScheduleTypeDto,
    description: 'Details for creating a new schedule type',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateScheduleTypeDto)
  scheduleType?: CreateScheduleTypeDto;
}
