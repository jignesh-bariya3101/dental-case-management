import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShadeDto {
  @ApiProperty({
    example: 'Shade Name',
    description: 'Name of the shade',
  })
  @IsString({ message: 'Shade name must be a string' })
  @IsNotEmpty({ message: 'Shade name is required' })
  shadeName: string;
}
