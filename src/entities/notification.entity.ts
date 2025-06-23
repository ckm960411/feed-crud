import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Restaurant } from './restaurant/restaurant.entity';

export enum NotificationType {
  REVIEW = 'REVIEW',
  BOOKMARK = 'BOOKMARK',
  BAROPOT_DATETIME_CHANGED = 'BAROPOT_DATETIME_CHANGED',
  BAROPOT_PARTICIPANT_JOINED = 'BAROPOT_PARTICIPANT_JOINED',
  BAROPOT_PARTICIPANT_JOIN_REQUEST_APPROVED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_APPROVED',
  BAROPOT_PARTICIPANT_JOIN_REQUEST_REJECTED = 'BAROPOT_PARTICIPANT_JOIN_REQUEST_REJECTED',
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
