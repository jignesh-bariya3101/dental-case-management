import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({
    example: 'abc123', // Example value for Swagger documentation
    description: 'Optional ID of the attachment', // Description for Swagger
    required: false, // Marked as optional in Swagger
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 10, // Example count value
    description: 'Optional count of the attachment',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  count?: number;

  @ApiProperty({
    example: 'Documents', // Example category value
    description: 'Optional category of the attachment',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}

export class CreateAttachmentArrayDto {
  @ApiProperty({
    example: 'xyz789', // Example caseId value
    description: 'Optional ID of the case',
    required: false,
  })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiProperty({
    type: CreateAttachmentDto, // The type of the objects in the array
    isArray: true, // Mark this property as an array
    description: 'An array of attachment objects',
  })
  attachments: CreateAttachmentDto[]; // Define the array of CreateAttachmentDto objects
}
