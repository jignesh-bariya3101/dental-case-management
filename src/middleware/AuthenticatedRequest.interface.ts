import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any; // Define the type of user property according to your user data structure
}
