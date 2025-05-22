import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@UserDecorator() user: User) {
    return user;
  }
}
