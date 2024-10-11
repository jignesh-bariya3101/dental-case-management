import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
  ValidateByOptions,
  IsEmail,
  IsEnum,
  IsObject,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CaseItemDto {
  @ApiProperty({
    example: 'tooth',
    description: 'tooth',
  })
  @IsString()
  @IsOptional()
  tooth: string;

  @ApiProperty({
    example: '1',
    description: '1',
  })
  @IsString()
  @IsOptional()
  shadeType: string;

  @ApiProperty({
    example: 'shadeOne',
    description: 'shadeOne',
  })
  @IsString()
  @IsOptional()
  shadeOne: string;

  @ApiProperty({
    example: 'shadeTwo',
    description: 'shadeTwo',
  })
  @IsString()
  @IsOptional()
  shadeTwo: string;

  @ApiProperty({
    example: 'shadeThree',
    description: 'shadeThree',
  })
  @IsString()
  @IsOptional()
  shadeThree: string;

  @ApiProperty({
    example: 'stumpShade',
    description: 'stumpShade',
  })
  @IsString()
  @IsOptional()
  stumpShade: string;

  @ApiProperty({
    example: 'dgdfsgsgsgs',
    description: 'dgdfsgsgsgs',
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    example: 'dgdfsgsgsgs',
    description: 'dgdfsgsgsgs',
  })
  @IsString()
  productTypeId: string;
}

export class CaseNoteDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class CaseInstructionDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class CreateCaseDto {
  // @ApiProperty({
  //   example: '34c68b9c-2fb3-4efa-8678-c68c896ea1e2',
  //   description: 'Note',
  // })
  // @IsString()
  // @IsNotEmpty()
  // patientId: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'Note',
  })
  @IsString()
  @IsNotEmpty()
  dentistId: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'doctorId',
  })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'Note',
    required: false,
  })
  @IsString()
  @IsOptional()
  manufactureId: string;

  @ApiProperty({ example: 'Rob', description: 'firstName' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Matt', description: 'lastName' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  // @ApiProperty({
  //   example: '2022-04-06T12:00:00Z',
  //   description: 'onHoldDate',
  // })
  // @IsOptional()
  // onHoldDate: Date = new Date();

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'receivedDate',
  })
  @IsOptional()
  receivedDate: Date = new Date();

  @ApiProperty({ type: [CaseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseItemDto)
  caseItems: CaseItemDto[];

  @ApiProperty({ type: [CaseNoteDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CaseNoteDto)
  caseNotes: CaseNoteDto[];

  @ApiProperty({ type: [CaseInstructionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseInstructionDto)
  caseInstructions: CaseInstructionDto[];

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'dueShipDate',
  })
  @IsOptional()
  dueShipDate: Date = new Date();

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'dueDate',
  })
  @IsOptional()
  dueDate: Date = new Date();

  // @ApiProperty({
  //   example: '2022-04-06T12:00:00Z',
  //   description: 'completedDate',
  // })
  // @IsOptional()
  // completedDate: Date = new Date();

  @ApiProperty({
    example: 'RUSH',
    description: 'panNum',
    required: false,
  })
  @IsString()
  @IsOptional()
  flag: string;

  @ApiProperty({
    example: 'DFE125DF1',
    description: 'panNum',
  })
  @IsString()
  @IsOptional()
  panNum?: string;

  @ApiProperty({
    example: '54e4gsdfsdg5e6g55',
    description: '54e4gsdfsdg5e6g55',
  })
  @IsString()
  @IsOptional()
  remakeCaseId: string;

  @ApiProperty({ example: '1,2,3', description: '1,2,3' })
  @IsString()
  @IsOptional()
  caseTags: string;

  @ApiProperty({ example: 'In Transist', description: 'In Transist' })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({
    example: 'DFE125DF1',
    description: 'panNum',
  })
  @IsString()
  @IsNotEmpty()
  level: string;

  // @ApiProperty({ example: 'Test', description: 'Note' })
  // @IsString()
  // @IsOptional()
  // scheduleTypeId: string;

  // @ApiProperty({
  //   example: 'Test',
  //   description: 'reason',
  // })
  // @IsString()
  // @IsOptional()
  // reason: string;

  @ApiProperty({
    example: '1',
    description: 'createdBy',
  })
  @IsString()
  @IsOptional()
  createdBy: string;

  @ApiProperty({
    example: '1',
    description: 'updatedBy',
  })
  @IsString()
  @IsOptional()
  updatedBy: string;

  // @ApiProperty({
  //   example: 'manNotes',
  //   description: 'manNotes',
  // })
  // @IsString()
  // @IsOptional()
  // manNotes: string;
}

export class CreatePatientDto {
  @ApiProperty({
    example: '1',
    description: 'firstName',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: '1',
    description: 'lastName',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class CreateCaseNotesDto {
  @ApiProperty({ type: [CaseNoteDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseNoteDto)
  caseNotes: CaseNoteDto[];
}

export class CreateCaseInstructionsDto {
  @ApiProperty({ type: [CaseInstructionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseInstructionDto)
  caseInstructions: CaseInstructionDto[];
}
