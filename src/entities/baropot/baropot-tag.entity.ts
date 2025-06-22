import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { BaropotToBaropotTag } from './baropot-to-baropot-tag.entity';

@Entity()
export class BaropotTag extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(
    () => BaropotToBaropotTag,
    (baropotToBaropotTag) => baropotToBaropotTag.baropotTag,
  )
  baropotToBaropotTags: BaropotToBaropotTag[];
}
