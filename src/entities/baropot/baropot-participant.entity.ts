import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Baropot } from './baropot.entity';
import { User } from '../user.entity';
import { BaropotJoinedStatus } from 'src/types/enum/baropot-joined-status.enum';

@Entity()
export class BaropotParticipant extends BaseEntity {
  @ManyToOne(() => Baropot, (baropot) => baropot.baropotParticipants)
  @JoinColumn()
  baropot: Baropot;

  @ManyToOne(() => User, (user) => user.baropotParticipants)
  @JoinColumn()
  user: User;

  @Column({
    default: false,
  })
  isHost: boolean;

  @Column({
    type: 'enum',
    enum: BaropotJoinedStatus,
    default: BaropotJoinedStatus.PENDING,
  })
  joinedStatus: BaropotJoinedStatus;

  @Column({ nullable: true })
  joinMessage: string | null;

  @Column({ nullable: true })
  hostMemo: string | null;
}
