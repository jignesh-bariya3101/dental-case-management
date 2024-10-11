import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PanService } from './pan.service';
import { PanController } from './pan.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [PanController],
  providers: [PanService, DatabaseService, AuthMiddleware],
})
export class PanModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude().forRoutes(PanController);
  }
}
