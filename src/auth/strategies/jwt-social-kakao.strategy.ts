import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID') ?? '',
      clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    console.log('success');
    console.log(accessToken);
    try {
      const { id, kakao_account } = profile._json;
      const user = {
        id,
        email: kakao_account.email,
        name: kakao_account.profile.nickname,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
