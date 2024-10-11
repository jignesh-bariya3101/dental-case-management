import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { ValidationExceptionFilter } from './exceptions/validation.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.use(morgan('tiny'));
  dotenv.config();
  const options = new DocumentBuilder()
    .setTitle('Next Dental')
    .setDescription('Next Dental Case Services APIs Documentation')
    .setVersion('1.0')
    .addTag('NextDebtalLabCaseService-API')
    .addBearerAuth()
    .addSecurity('X-Passkey', {
      type: 'apiKey',
      in: 'headers',
      name: 'X-Passkey',
    })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  // const roleSeeder = app.get(UserSeeder);
  // await roleSeeder.seed();
  app.enableCors();
  await app.listen(8002);
}
bootstrap();
