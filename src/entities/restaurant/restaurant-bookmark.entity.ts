import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class RestaurantBookmark extends BaseEntity {
  @ManyToOne(() => User, (user) => user.bookmarks)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.bookmarks)
  @JoinColumn()
  restaurant: Restaurant;
}
