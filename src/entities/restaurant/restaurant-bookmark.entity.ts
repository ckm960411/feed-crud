import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class RestaurantBookmark extends BaseEntity {
  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.bookmarks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  restaurant: Restaurant;
}
