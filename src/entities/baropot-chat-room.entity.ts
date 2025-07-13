import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Baropot } from './baropot/baropot.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class BaropotChatRoom extends BaseEntity {
  @Column()
  name: string;

  // 바로팟과 1:1 관계
  @OneToOne(() => Baropot, (baropot) => baropot.chatRoom)
  @JoinColumn()
  baropot: Baropot;
}
