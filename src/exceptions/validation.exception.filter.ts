import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.info(status);

    const errors = exception.getResponse() as { message: string[] };

    let replacedText = errors.message[0].replace(/\w+\.\s*/g, '');

    const customResponse = {
      status: false,
      message: replacedText,
    };

    response.status(status).json(customResponse);
  }
}
