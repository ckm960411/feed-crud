import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Baropot } from './baropot.entity';
import { BaropotTag } from './baropot-tag.entity';

@Entity()
export class BaropotToBaropotTag extends BaseEntity {
  @ManyToOne(() => Baropot, (baropot) => baropot.baropotToBaropotTags)
  @JoinColumn()
  baropot: Baropot;

  @ManyToOne(() => BaropotTag, (baropotTag) => baropotTag.baropotToBaropotTags)
  @JoinColumn()
  baropotTag: BaropotTag;
}
