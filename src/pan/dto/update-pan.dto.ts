import { PartialType } from '@nestjs/swagger';
import { CreatePanDto } from './create-pan.dto';

export class UpdatePanDto extends PartialType(CreatePanDto) {}
