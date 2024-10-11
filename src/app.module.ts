import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { ScheduleTypeModule } from './schedule-type/schedule-type.module';
import { CaseModule } from './case/case.module';
import { ShadesModule } from './shades/shades.module';
import { AwsModule } from './aws/aws.module';
import { ShippingController } from './shipping/shipping.controller';
import { ShippingService } from './shipping/shipping.service';
import { ShippingModule } from './shipping/shipping.module';
import { UpsService } from './ups/ups.service';
import { UpsModule } from './ups/ups.module';
import { EmailService } from './helper/Emailservice';
import { TaxjarModule } from './taxjar/taxjar.module';
import { TaxjarService } from './taxjar/taxjar.service';
import { ConfigModule } from '@nestjs/config';
import { PanModule } from './pan/pan.module';
import { CasetagsModule } from './casetags/casetags.module';
@Module({
  imports: [
    DatabaseModule,
    CaseModule,
    ScheduleTypeModule,
    ShadesModule,
    AwsModule,
    ShippingModule,
    UpsModule,
    TaxjarModule,
    ConfigModule.forRoot(),
    PanModule,
    CasetagsModule,
  ],
  controllers: [AppController, ShippingController],
  providers: [
    AppService,
    DatabaseService,
    ShippingService,
    UpsService,
    EmailService,
    TaxjarService,
  ],
})
export class AppModule {}
