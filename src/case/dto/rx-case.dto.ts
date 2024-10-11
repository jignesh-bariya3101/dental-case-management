import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRxCaseDto {
  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'Note',
  })
  @IsString()
  @IsNotEmpty()
  dentistId: string;

  @ApiProperty({
    example: 'level',
    description: 'level',
  })
  @IsString()
  @IsNotEmpty()
  level: string;
}
