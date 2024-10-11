import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { DatabaseService } from '../database/database.service';
import { HttpModule } from '@nestjs/axios';
import { AwsService } from 'src/aws/aws.service';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { EmailService } from 'src/helper/Emailservice';
import { TaxjarModule } from 'src/taxjar/taxjar.module';
import { TaxjarService } from 'src/taxjar/taxjar.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  providers: [
    CaseService,
    DatabaseService,
    AwsService,
    AuthMiddleware,
    EmailService,
    TaxjarService,
  ],
  controllers: [CaseController],
})
export class CaseModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CaseController);
  }
}
