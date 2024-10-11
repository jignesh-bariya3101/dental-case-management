// src/taxjar/taxjar.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaxjarService } from './taxjar.service';

@Module({
  imports: [ConfigModule],
  providers: [TaxjarService],
  exports: [TaxjarService],
})
export class TaxjarModule {}
