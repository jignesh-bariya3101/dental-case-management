import { PartialType } from '@nestjs/swagger';
import { CreateCasetagDto } from './create-casetag.dto';

export class UpdateCasetagDto extends PartialType(CreateCasetagDto) {}
