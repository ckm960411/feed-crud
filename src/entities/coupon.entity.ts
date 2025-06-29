import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE', // 정률 할인
  FIXED_AMOUNT = 'FIXED_AMOUNT', // 정액 할인
}

@Entity()
export class Coupon extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  expiredAt: Date;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType;

  @Column() // 정률 할인의 경우 퍼센티지, 정액 할인의 경우 금액
  amount: number;
}
