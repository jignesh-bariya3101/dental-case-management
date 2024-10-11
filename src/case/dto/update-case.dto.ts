import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsObject,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UpdateCaseItemDto {
  @ApiProperty({
    example: 'manNotes',
    description: 'manNotes',
    required: false,
  })
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty({
    example: 'tooth',
    description: 'tooth',
    required: false,
  })
  @IsString()
  @IsOptional()
  tooth: string;

  @ApiProperty({
    example: '1',
    description: '1',
    required: false,
  })
  @IsString()
  @IsOptional()
  shadeType: string;

  @ApiProperty({
    example: 'shadeOne',
    description: 'shadeOne',
    required: false,
  })
  @IsString()
  @IsOptional()
  shadeOne: string;

  @ApiProperty({
    example: 'shadeTwo',
    description: 'shadeTwo',
    required: false,
  })
  @IsString()
  @IsOptional()
  shadeTwo: string;

  @ApiProperty({
    example: 'shadeThree',
    description: 'shadeThree',
    required: false,
  })
  @IsString()
  @IsOptional()
  shadeThree: string;

  @ApiProperty({
    example: 'stumpShade',
    description: 'stumpShade',
    required: false,
  })
  @IsString()
  @IsOptional()
  stumpShade: string;

  @ApiProperty({
    example: 'dgdfsgsgsgs',
    description: 'dgdfsgsgsgs',
    required: false,
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    example: 'dgdfsgsgsgs',
    description: 'dgdfsgsgsgs',
    required: false,
  })
  @IsString()
  productTypeId: string;
}
export class UpdateCaseNoteDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    example: '1',
    description: 'id',
    required: false,
  })
  @IsString()
  @IsOptional()
  id: string;
}

export class UpdateCaseInstructionDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    example: '1',
    description: 'id',
    required: false,
  })
  @IsString()
  @IsOptional()
  id: string;
}

export class UpdateCaseDto {
  @ApiProperty({ example: 'Test', description: 'Note' })
  @IsString()
  @IsOptional()
  patientId: string;

  @ApiProperty({
    example: 'ManufatureId',
    description: 'dgsdrg',
    required: false,
  })
  @IsString()
  @IsOptional()
  manufactureId: string;

  @ApiProperty({
    example: 'remakeCaseId',
    description: 'dgsdrg',
    required: false,
  })
  @IsString()
  @IsOptional()
  remakeCaseId: string;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'remakeStatus',
  })
  @IsOptional()
  remakeStatus: Date = new Date();

  @ApiProperty({
    example: false,
    description: 'true or false',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRemakeCase: boolean;

  @ApiProperty({
    example: '725e551d-d611-4be8-91ca-12151f3b1a18',
    description: 'doctorId',
  })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({
    example: '["Tag1","Tag2"]',
    description: '[]',
    required: false,
  })
  @IsString()
  @IsOptional()
  caseTags: string;

  @ApiProperty({ example: 'Test', description: 'firstName' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ example: 'Test', description: 'lastName' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: 'Test', description: 'Note' })
  @IsString()
  @IsOptional()
  dentistId: string;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'onHoldDate',
  })
  @IsOptional()
  onHoldDate: Date = new Date();

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'holdActionDate',
  })
  @IsOptional()
  holdActionDate?: Date;

  @ApiProperty({
    example: 'Defect piece',
    description: 'holdResolveReason',
  })
  @IsString()
  @IsOptional()
  holdResolveReason?: string;

  @ApiProperty({
    example: 'Defect piece',
    description: 'holdActionDate',
  })
  @IsString()
  @IsOptional()
  onHoldReason?: string;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'isCanceledFromOnHold',
  })
  @IsOptional()
  isCanceledFromOnHold?: Date;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'receivedDate',
  })
  @IsOptional()
  receivedDate: Date = new Date();

  @ApiProperty({ type: [UpdateCaseItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  caseItems: [UpdateCaseItemDto];

  @ApiProperty({ type: [UpdateCaseNoteDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCaseNoteDto)
  caseNotes: UpdateCaseNoteDto[];

  @ApiProperty({ type: [UpdateCaseInstructionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateCaseInstructionDto)
  caseInstructions: UpdateCaseInstructionDto[];

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

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'completedDate',
  })
  @IsOptional()
  completedDate: Date = new Date();

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

  @ApiProperty({ example: 'In Transist', description: 'In Transist' })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({
    example: 'classic',
    description: 'level',
  })
  @IsString()
  @IsOptional()
  level: string;

  @ApiProperty({ example: 'Test', description: 'Note' })
  @IsString()
  @IsOptional()
  scheduleTypeId: string;

  @ApiProperty({
    example: 'Test',
    description: 'reason',
  })
  @IsString()
  @IsOptional()
  reason: string;

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

  @ApiProperty({
    example: 'manNotes',
    description: 'manNotes',
  })
  @IsString()
  @IsOptional()
  manNotes: string;
}

export class CaseNoteDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    example: 'affa-fasf-sfadsfa',
    description: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CaseInstructionDto {
  @ApiProperty({
    example: '1',
    description: 'note',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    example: 'affa-fasf-sfadsfa',
    description: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UpdateCaseNotesDto {
  @ApiProperty({ type: [CaseNoteDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CaseNoteDto)
  caseNotes: CaseNoteDto[];
}

export class UpdateCaseInstructionsDto {
  @ApiProperty({ type: [CaseInstructionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CaseInstructionDto)
  caseInstructions: CaseInstructionDto[];
}
