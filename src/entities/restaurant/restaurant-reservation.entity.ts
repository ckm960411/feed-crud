import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Restaurant } from './restaurant.entity';
import { User } from '../user.entity';
import { RestaurantReservationStatus } from 'src/types/enum/restaurant-reservation-status.enum';

@Entity()
export class RestaurantReservation extends BaseEntity {
  @Column()
  date: string; // yyyy-MM-dd

  @Column()
  time: string; // HH:mm

  @Column()
  status: RestaurantReservationStatus;

  @Column({ nullable: true })
  participants: number | null;

  @Column({ nullable: true })
  description: string | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations)
  restaurant: Restaurant;

  @ManyToOne(() => User, (user) => user.restaurantReservations)
  user: User;
}
