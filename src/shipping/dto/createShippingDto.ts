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
import { ShippingFromType, ShippingToType } from '@prisma/client';

export class CreateShippingDto {
  @ApiProperty({
    example: 'ups',
    description: 'shipper',
  })
  @IsString()
  @IsNotEmpty()
  shipper: string;

  @ApiProperty({
    example: 'dfsdgsdg',
    description: 'sgdfrghdfgfsdfghdfrg',
  })
  @IsString()
  @IsOptional()
  trackingNum: string;

  @ApiProperty({
    example: '2024-06-24T05:22:20.422Z',
    description: 'estPickup',
  })
  @IsString()
  @IsOptional()
  estPickup: string;

  @ApiProperty({
    example: '2024-06-24T05:22:20.422Z',
    description: 'estDropOff',
  })
  @IsString()
  @IsOptional()
  estDropOff: string;

  @ApiProperty({
    enum: ShippingFromType,
    enumName: 'ShippingFromType',
    example: 'LAB',
    description: 'Type of the ShippingFromType',
  })
  @IsEnum(ShippingFromType, {
    message:
      'Invalid ShippingFromType Must be one of : Lab,Dentist,Manufacture',
  })
  @IsNotEmpty()
  fromType: ShippingFromType;

  @ApiProperty({
    example: 'fromTypeId',
    description: 'fromTypeId',
  })
  @IsString()
  @IsOptional()
  fromTypeId: string;

  @ApiProperty({
    enum: ShippingToType,
    enumName: 'ShippingToType',
    example: 'LAB',
    description: 'Type of the ShippingToType',
  })
  @IsEnum(ShippingToType, {
    message: 'Invalid ShippingToType Must be one of:Lab,Dentist,Manufacture',
  })
  @IsOptional()
  toType: ShippingToType;

  @ApiProperty({
    example: 'toTypeId',
    description: 'toTypeId',
  })
  @IsString()
  @IsOptional()
  toTypeId: string;

  @ApiProperty({
    example: '["1","2","3"]',
    description: 'case id ["1","2","3"]',
  })
  @IsArray()
  caseIds: [];
}
