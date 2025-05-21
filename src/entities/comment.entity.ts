import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Feed } from './feed.entity';
import { User } from './user.entity';

@Entity()
export class FeedComment extends BaseEntity {
  @Column()
  content: string;

  @Column()
  userId: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column()
  feedId: number;

  @JoinColumn()
  @ManyToOne(() => Feed, (feed) => feed.comments)
  feed: Feed;
}
