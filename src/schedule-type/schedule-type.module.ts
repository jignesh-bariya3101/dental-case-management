import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ScheduleTypeController } from './schedule-type.controller';
import { ScheduleTypeService } from './schedule-type.service';
import { DatabaseService } from '../database/database.service';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [ScheduleTypeController],
  providers: [ScheduleTypeService, DatabaseService, AuthMiddleware],
})
export class ScheduleTypeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude().forRoutes(ScheduleTypeController);
  }
}
