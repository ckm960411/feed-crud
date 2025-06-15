import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('알림')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: '알림 스트리밍',
    description: '알림을 스트리밍합니다.',
  })
  @Sse('stream')
  streamNotifications(@User() user: { id: number }): Observable<MessageEvent> {
    return this.notificationService.getNotifications(user.id).pipe(
      map((notification) => ({
        data: notification,
        type: 'message',
        id: notification.id.toString(),
      })),
    );
  }

  @Get()
  async getUnreadNotifications(@User() user: { id: number }) {
    return this.notificationService.getUnreadNotifications(user.id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: number) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }
}
