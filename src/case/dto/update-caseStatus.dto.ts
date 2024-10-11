// updateCasestatus.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { CaseStatus } from '@prisma/client'; // Ensure this import is correct based on your Prisma setup

export class UpdateCasestatusDto {
  @ApiProperty({
    description: 'Array of case IDs to be updated',
    type: [String],
    example: ['1', '2', '3'],
  })
  @IsArray()
  @IsString({ each: true })
  caseIds: string[];

  @ApiProperty({
    description: 'The status to set for the cases',
    enum: CaseStatus,
    example: CaseStatus.Completed,
  })
  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;
}
