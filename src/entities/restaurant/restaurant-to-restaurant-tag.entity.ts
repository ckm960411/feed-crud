import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Restaurant } from './restaurant.entity';
import { RestaurantTag } from './restaurant-tag.entity';

@Entity()
export class RestaurantToRestaurantTag extends BaseEntity {
  @ManyToOne(
    () => Restaurant,
    (restaurant) => restaurant.restaurantToRestaurantTags,
  )
  @JoinColumn()
  restaurant: Restaurant;

  @ManyToOne(
    () => RestaurantTag,
    (restaurantTag) => restaurantTag.restaurantToRestaurantTags,
  )
  @JoinColumn()
  restaurantTag: RestaurantTag;
}
