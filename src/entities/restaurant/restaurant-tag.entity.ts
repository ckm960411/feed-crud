import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RestaurantToRestaurantTag } from './restaurant-to-restaurant-tag.entity';

@Entity()
export class RestaurantTag extends BaseEntity {
  @ApiProperty({
    description: '맛집 태그',
    example: '데이트코스',
  })
  @IsString()
  @Column()
  name: string;

  @OneToMany(
    () => RestaurantToRestaurantTag,
    (restaurantToRestaurantTag) => restaurantToRestaurantTag.restaurantTag,
  )
  restaurantToRestaurantTags: RestaurantToRestaurantTag[];
}
