import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUpdateMessageCenterDto {
  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'Main Unique Id Its used for update record.',
    required: false,
  })
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty({
    example: 'DENTIST or MANUFACTURE or LAB',
    description: 'fromType',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromType: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'fromTypeId',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromTypeId: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'DentistId',
    required: false,
  })
  @IsString()
  @IsOptional()
  dentistId: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'ManufactureId',
    required: false,
  })
  @IsString()
  @IsOptional()
  manufactureId: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'CaseId',
  })
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({
    example: 'Dentist',
    description: 'Dentist or Manufacture',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    example: 'This is case message.',
    description: 'Message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
