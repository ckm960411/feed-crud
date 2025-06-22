import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { BaropotStatus } from 'src/types/enum/baropot-status.enum';
import { ParticipantGender } from 'src/types/enum/participant-gender.enum';
import { ParticipantAgeGroup } from 'src/types/enum/participant-age-group.enum';
import { ContactMethod } from 'src/types/enum/contact-method.enum';
import { PaymentMethod } from 'src/types/enum/payment-method.enum';
import { BaropotToBaropotTag } from './baropot-to-baropot-tag.entity';
import { BaropotParticipant } from './baropot-participant.entity';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class Baropot extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BaropotStatus,
  })
  status: BaropotStatus;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column()
  maxParticipants: number;

  @Column()
  date: string; // yyyy-MM-dd

  @Column()
  time: string; // HH:mm

  @Column({
    type: 'enum',
    enum: ParticipantGender,
    default: ParticipantGender.ANY,
  })
  participantGender: ParticipantGender;

  @Column({
    type: 'enum',
    enum: ParticipantAgeGroup,
    default: ParticipantAgeGroup.ANY,
  })
  participantAgeGroup: ParticipantAgeGroup;

  @Column({
    type: 'enum',
    enum: ContactMethod,
    nullable: true,
  })
  contactMethod: ContactMethod | null;

  @Column({
    nullable: true,
  })
  estimatedCostPerPerson: number | null;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.DUTCH_PAY,
  })
  paymentMethod: PaymentMethod;

  @Column()
  description: string;

  @Column()
  rule: string | null;

  @OneToMany(
    () => BaropotToBaropotTag,
    (baropotToBaropotTag) => baropotToBaropotTag.baropot,
  )
  baropotToBaropotTags: BaropotToBaropotTag[];

  @OneToMany(
    () => BaropotParticipant,
    (baropotParticipant) => baropotParticipant.baropot,
  )
  baropotParticipants: BaropotParticipant[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.baropots)
  @JoinColumn()
  restaurant: Restaurant;
}
