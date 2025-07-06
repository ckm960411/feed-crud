import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { SigninResponse } from './dto/response/signin.response';
import { JwtPayload } from './types/jwt-payload.interface';
import { GoogleUser } from './types/google-user.interface';
import { SigninMethod } from './types/signin-method.enum';
import { KakaoUser } from './types/kakao-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async signUp({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<Omit<User, 'password'>> {
    const SALT_ROUNDS = +this.configService.get('SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.userService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<SigninResponse> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '24h',
      }),
    };
  }

  async googleSignin(user: GoogleUser) {
    if (!user) {
      throw new UnauthorizedException('Google 인증에 실패했습니다.');
    }

    let existingUser: User | Omit<User, 'password'> =
      await this.userService.findByEmail(user.email);

    if (!existingUser) {
      existingUser = await this.userService.createUser({
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        password: '', // 소셜로그인을 한 사용자는 비밀번호가 없음
        provider: SigninMethod.GOOGLE,
        providerId: user.id,
      });
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    };
  }

  async kakaoSignin(user: KakaoUser) {
    if (!user) {
      throw new UnauthorizedException('Kakao 인증에 실패했습니다.');
    }

    let existingUser: User | Omit<User, 'password'> =
      await this.userService.findByEmail(user.email);

    if (!existingUser) {
      existingUser = await this.userService.createUser({
        name: user.name,
        email: user.email,
        password: '', // 소셜로그인을 한 사용자는 비밀번호가 없음
        provider: SigninMethod.KAKAO,
        providerId: user.id.toString(),
      });
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    };
  }
}
