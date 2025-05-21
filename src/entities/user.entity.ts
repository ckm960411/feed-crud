import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Feed } from './feed.entity';
import { FeedComment } from './comment.entity';
import { Like } from './like.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Feed, (feed) => feed.user)
  feeds: Feed[];

  @OneToMany(() => FeedComment, (comment) => comment.user)
  comments: FeedComment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
