import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Restaurant } from './restaurant.entity';

@Entity()
export class RestaurantPhoto extends BaseEntity {
  @ApiProperty({
    description: '사진 URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  @Column()
  url: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.photos)
  @JoinColumn()
  restaurant: Restaurant;
}
