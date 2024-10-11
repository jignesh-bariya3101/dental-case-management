import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CasetagsService } from './casetags.service';
import { CasetagsController } from './casetags.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [CasetagsController],
  providers: [CasetagsService, AuthMiddleware, DatabaseService],
})
export class CasetagsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude().forRoutes(CasetagsController);
  }
}
