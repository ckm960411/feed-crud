import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from 'src/entities/notification.entity';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notificationSubjects: Map<number, Subject<Notification>> = new Map();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification({
    type,
    message,
    recipientId,
    senderId,
    restaurantId,
  }: {
    type: NotificationType;
    message: string;
    recipientId: number;
    senderId: number;
    restaurantId: number;
  }) {
    this.logger.log(
      `알림 생성 시작: 타입 ${type}, 수신자 ID ${recipientId}, 발신자 ID ${senderId}, 레스토랑 ID ${restaurantId}`,
    );

    const notification = await this.notificationRepository.save({
      type,
      message,
      recipient: { id: recipientId },
      sender: { id: senderId },
      restaurant: { id: restaurantId },
    });

    const subject = this.getOrCreateSubject(recipientId);
    subject.next(notification);

    this.logger.log(
      `알림 생성 완료: 알림 ID ${notification.id}, 메시지: ${message}`,
    );

    return notification;
  }

  getNotifications(userId: number): Observable<Notification> {
    return this.getOrCreateSubject(userId)
      .asObservable()
      .pipe(
        map((notification) => ({
          ...notification,
          createdAt: new Date(),
        })),
      );
  }

  private getOrCreateSubject(userId: number): Subject<Notification> {
    if (!this.notificationSubjects.has(userId)) {
      this.notificationSubjects.set(userId, new Subject<Notification>());
    }
    return this.notificationSubjects.get(userId);
  }

  async markAsRead(notificationId: number) {
    await this.notificationRepository.update(notificationId, { isRead: true });
  }

  async getUnreadNotifications(userId: number) {
    return this.notificationRepository.find({
      where: {
        recipient: { id: userId },
        isRead: false,
      },
      relations: ['sender', 'restaurant'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
