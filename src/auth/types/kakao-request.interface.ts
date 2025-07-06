import { Request } from 'express';
import { KakaoUser } from './kakao-user.interface';

export interface KakaoRequest extends Request {
  user: KakaoUser;
}
