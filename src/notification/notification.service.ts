import { Injectable } from '@nestjs/common';
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
    const notification = await this.notificationRepository.save({
      type,
      message,
      recipient: { id: recipientId },
      sender: { id: senderId },
      restaurant: { id: restaurantId },
    });

    const subject = this.getOrCreateSubject(recipientId);
    subject.next(notification);

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
