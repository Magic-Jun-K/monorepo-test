import { Request } from 'express';

import { AuthUser } from './user.interface';

export interface AuthRequest extends Request {
  user: AuthUser;
}
