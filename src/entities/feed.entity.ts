import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { FeedComment } from './comment.entity';
import { Like } from './like.entity';

@Entity()
export class Feed extends BaseEntity {
  @Column()
  content: string;

  @Column()
  userId: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.feeds)
  user: User;

  @OneToMany(() => FeedComment, (comment) => comment.feed)
  comments: FeedComment[];

  @OneToMany(() => Like, (like) => like.feed)
  likes: Like[];
}
