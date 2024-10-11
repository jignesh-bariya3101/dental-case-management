import { ApiProperty } from '@nestjs/swagger';
import { PatientGenderType } from '@prisma/client';
import { integer } from 'aws-sdk/clients/cloudfront';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CaseInstructionDto } from './create-case.dto';
import { Type } from 'class-transformer';

class UpdateCaseItemDto {
  @ApiProperty({
    example: 'b9803e7d-daa9-4737-997f-f10b8e8cdac6',
    description: 'Item ID',
  })
  @IsString()
  @IsOptional()
  itemId?: string;

  @ApiProperty({
    example: '1,2,3,4',
    description: 'Tooth numbers',
  })
  @IsString()
  @IsOptional()
  tooth?: string;

  @ApiProperty({
    example: '2',
    description: 'Shade type',
  })
  @IsString()
  @IsOptional()
  shadeType?: string;

  @ApiProperty({
    example: '45d03d69-e6a5-4ae3-be00-a02cb918a50c',
    description: 'First shade',
  })
  @IsString()
  @IsOptional()
  shadeOne?: string;

  @ApiProperty({
    example: '7ee72e0e-618e-4b39-8a0f-2927f60a4fc1',
    description: 'Second shade',
  })
  @IsString()
  @IsOptional()
  shadeTwo?: string;

  @ApiProperty({
    example: null,
    description: 'Third shade',
  })
  @IsString()
  @IsOptional()
  shadeThree?: string;

  @ApiProperty({
    example: '45d03d69-e6a5-4ae3-be00-a02cb918a50c',
    description: 'Stump shade',
  })
  @IsString()
  @IsOptional()
  stumpShade?: string;

  @ApiProperty({
    example: 'aa07b1a2-d04d-41b9-b6a9-ce0d3b9e7b60',
    description: 'Product type ID',
  })
  @IsString()
  @IsOptional()
  productTypeId?: string;
}

export class UpdateRxCaseDto {
  @ApiProperty({ example: 'Test', description: 'Note' })
  @IsString()
  @IsOptional()
  patientId: string;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'rxDate',
  })
  @IsOptional()
  rxDate?: Date = new Date();

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'deliverBy',
  })
  @IsOptional()
  deliverBy?: Date = new Date();

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'receivedDate',
  })
  @IsOptional()
  receivedDate?: Date = new Date();

  @ApiProperty({
    description: 'Type of the model',
    required: false,
  })
  @IsOptional()
  flag?: string;

  @ApiProperty({ type: [UpdateCaseItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  caseItems: [UpdateCaseItemDto];

  @ApiProperty({ type: [CaseInstructionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaseInstructionDto)
  @IsOptional()
  caseInstructions?: CaseInstructionDto[] | null;

  @ApiProperty({ example: 'Rob', description: 'firstName' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Matt', description: 'lastName' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '2022-04-06T12:00:00Z',
    description: 'dateOfBirth',
  })
  @IsOptional()
  dateOfBirth: Date = new Date();

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '0-20',
    description: 'Age of the patient',
  })
  age?: string;

  @ApiProperty({
    enum: PatientGenderType,
    enumName: 'PatientGenderType',
    example: 'MALE',
    description: 'Gender of the patient',
  })
  @IsOptional()
  @IsEnum(PatientGenderType, {
    message: 'Gender must be one of: MALE, FEMALE and OTHERS',
  })
  gender?: PatientGenderType | 'MALE';
}
