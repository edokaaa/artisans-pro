import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ServiceCategory } from './service-category.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('service_category_skills')
export class ServiceCategorySkill extends BaseEntity {
  @Index('idx_skill_name')
  @Column()
  name: string;

  @Index('idx_skill_slug')
  @Column({ unique: true })
  slug: string;

  @Index('idx_skill_category', { synchronize: false })
  @ManyToOne(() => ServiceCategory, (category) => category.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_category_id' })
  category: ServiceCategory;
}
