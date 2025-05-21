import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Feed } from './feed.entity';

@Entity()
export class Like extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  feedId: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Feed, (feed) => feed.likes)
  feed: Feed;
}
