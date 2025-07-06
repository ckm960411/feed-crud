import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  //UseGuards의 이름과 동일해야함
  constructor(configService: ConfigService) {
    super({
      //자식의 constructor를 부모의 constructor에 넘기는 방법은 super를 사용하면 된다.
      clientID: configService.get('GOOGLE_CLIENT_ID'), //.env파일에 들어있음
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'), //.env파일에 들어있음
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'), //.env파일에 들어있음
      scope: ['email', 'profile'],
    });
  }

  // refreshToken을 사용하기 위해선 아래 주석을 해제해야 함
  // authorizationParams(): { [key: string]: string } {
  //   return {
  //     access_type: 'offline',
  //     prompt: 'consent',
  //   };
  // }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    console.log('success');
    console.log(accessToken);
    try {
      const { id, name, emails, photos } = profile;
      const user = {
        id,
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        photo: photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
