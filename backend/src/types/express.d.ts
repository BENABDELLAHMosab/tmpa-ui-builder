import { Request } from 'express';
import { AccountStatus } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        accountStatus?: AccountStatus;
      };
    }
  }
}
