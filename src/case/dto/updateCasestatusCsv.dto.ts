// updateCasestatusCsv.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaseStatus } from '@prisma/client'; // Ensure this import is correct based on your Prisma setup

class CaseIdAccountId {
  @ApiProperty({ description: 'Account ID', example: '121' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Case ID', example: '1212' })
  @IsString()
  caseId: string;
}

export class UpdateCasestatusCsvDto {
  @ApiProperty({
    description: 'Array of objects with accountId and caseId',
    type: [CaseIdAccountId],
    example: [
      { accountId: '121', caseId: '1212' },
      { accountId: '1211', caseId: '12112' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaseIdAccountId)
  caseIds: CaseIdAccountId[];

  @ApiProperty({
    description: 'The status to set for the cases',
    enum: CaseStatus,
    example: CaseStatus.Completed,
  })
  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;
}
