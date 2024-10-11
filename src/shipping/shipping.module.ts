import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmailService } from 'src/helper/Emailservice';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { UpsService } from 'src/ups/ups.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  providers: [
    EmailService,
    ShippingService,
    DatabaseService,
    AuthMiddleware,
    UpsService,
  ],
  controllers: [ShippingController],
})
export class ShippingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ShippingService);
  }
}
