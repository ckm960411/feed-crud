import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { SigninResponse } from './dto/response/signin.response';
import { SignupRequest } from './dto/request/signup.request';
import { SigninRequest } from './dto/request/signin.request';
import { GoogleAuthGuard } from './strategies/google-auth.guard';
import { GoogleRequest } from './types/google-request.interface';
import { Response } from 'express';
import { KakaoAuthGuard } from './strategies/kakao-auth.guard';
import { KakaoRequest } from './types/kakao-request.interface';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body() request: SignupRequest,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.signUp({
      email: request.email,
      name: request.name,
      password: request.password,
    });
  }

  @Post('signin')
  async signin(@Body() request: SigninRequest): Promise<SigninResponse> {
    return this.authService.signIn({
      email: request.email,
      password: request.password,
    });
  }

  @ApiOperation({
    summary: '구글 로그인 요청',
  })
  @Get('/signin/google')
  @UseGuards(GoogleAuthGuard)
  async googleSignin() {
    // 구글 로그인 페이지로 리다이렉트
    return;
  }

  @ApiOperation({
    summary: '구글 로그인 콜백 (BE only)',
    description:
      '백엔드에서 처리하는 구글 로그인 콜백 API입니다. 성공시 클라이언트 웹 URL로 /auth/google/callback?accessToken={accessToken}으로 리다이렉트됩니다.',
  })
  @Get('/signin/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    // Google 인증이 성공하면 이 메서드가 실행됩니다
    // req.user에 Google 프로필 정보가 들어있습니다
    const { accessToken } = await this.authService.googleSignin(req.user);
    const webUrl = this.configService.get<string>('WEB_URL');
    res.redirect(`${webUrl}/auth/google/callback?accessToken=${accessToken}`);
  }

  @ApiOperation({
    summary: '카카오 로그인 요청',
  })
  @Get('/signin/kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuth() {
    // 카카오 로그인 페이지로 리다이렉트됨
    return;
  }

  @ApiOperation({
    summary: '카카오 로그인 콜백 (BE only)',
    description:
      '백엔드에서 처리하는 카카오 로그인 콜백 API입니다. 성공시 클라이언트 웹 URL로 /auth/kakao/callback?accessToken={accessToken}으로 리다이렉트됩니다.',
  })
  @Get('/signin/kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuthCallback(@Req() req: KakaoRequest, @Res() res: Response) {
    const { accessToken } = await this.authService.kakaoSignin(req.user);
    const webUrl = this.configService.get<string>('WEB_URL');
    res.redirect(`${webUrl}/auth/kakao/callback?accessToken=${accessToken}`);
  }
}
