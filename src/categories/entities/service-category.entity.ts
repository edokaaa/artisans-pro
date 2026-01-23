import { BaseEntity } from '../../common/entities/base.entity';
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ServiceCategorySkill } from './service-category-skill.entity';

@Entity('service_categories')
export class ServiceCategory extends BaseEntity {
  @Index('idx_category_name')
  @Column({ unique: true })
  name: string;

  @Index('idx_category_slug')
  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @OneToMany(() => ServiceCategorySkill, (skill) => skill.category)
  skills: ServiceCategorySkill[];
}
