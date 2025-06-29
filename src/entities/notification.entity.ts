import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Restaurant } from './restaurant/restaurant.entity';

export enum NotificationType {
  REVIEW = 'REVIEW', // 리뷰 작성 알림
  BOOKMARK = 'BOOKMARK', // 북마크 알림
  BAROPOT_DATETIME_CHANGED = 'BAROPOT_DATETIME_CHANGED', // 바로팟 시간 변경 알림
  BAROPOT_PARTICIPANT_JOINED = 'BAROPOT_PARTICIPANT_JOINED', // 바로팟 참가 알림
  BAROPOT_PARTICIPANT_JOIN_REQUEST_APPROVED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_APPROVED', // 바로팟 참가 요청 승인 알림
  BAROPOT_PARTICIPANT_JOIN_REQUEST_REJECTED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_REJECTED', // 바로팟 참가 요청 거절 알림
  BAROPOT_PARTICIPANT_JOIN_REQUEST_REMOVED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_REMOVED', // 바로팟 참가 요청 강제퇴장 알림
  BAROPOT_PARTICIPANT_JOIN_REQUEST_CANCELLED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_CANCELLED', // 바로팟 참가 요청 취소 알림
  BAROPOT_STATUS_UPDATED = 'BAROPOT_STATUS_UPDATED', // 바로팟 상태 변경 알림
  RESERVATION_CREATED = 'RESERVATION_CREATED', // 예약 생성 알림
}

@Entity()
export class Notification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn()
  recipient: User;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Restaurant)
  @JoinColumn()
  restaurant: Restaurant;
}
