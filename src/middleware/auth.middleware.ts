import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AuthenticatedRequest } from './AuthenticatedRequest.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly userServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.userServiceUrl = `${process.env.USER_SERVER_BACKEND}/user`;
  }

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Extract JWT token from authorization header
      const token: string | undefined = req.headers['authorization'];
      console.info('token', token);
      if (!token) {
        throw new HttpException(
          'Authorization token not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      console.info('this.userServiceUrl', this.userServiceUrl);
      const authUrlService = `${process.env.USER_SERVER_BACKEND}/user`;
      console.info('authUrlService', authUrlService);

      const meEndpoint: string = `${this.userServiceUrl}/me`;
      console.info('meEndpoint', meEndpoint);

      const headers = { Authorization: token };

      // Make HTTP request to userService
      const response = await this.httpService
        .get(meEndpoint, { headers })
        .pipe(
          catchError((error: AxiosError) => {
            console.info('AxiosError', error);

            throw new HttpException(
              'Unauthorized user',
              HttpStatus.UNAUTHORIZED,
            );
          }),
        )
        .toPromise();

      // Check if the response is valid and proceed
      if (response && response.data) {
        req.user = response.data.data.user;
        next();
      } else {
        throw new HttpException('Unauthorized user', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      next(error);
    }
  }
}
