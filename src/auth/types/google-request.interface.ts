import { Request } from 'express';
import { GoogleUser } from './google-user.interface';

export interface GoogleRequest extends Request {
  user: GoogleUser;
}
