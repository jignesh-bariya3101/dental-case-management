import { Module } from '@nestjs/common';
import { ShadesService } from './shades.service';
import { ShadesController } from './shades.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [ShadesController],
  providers: [ShadesService, DatabaseService],
})
export class ShadesModule {}
