// categories/entities/service-category-skill.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceCategory } from './service-category.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('service_category_skills')
export class ServiceCategorySkill extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => ServiceCategory, (category) => category.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_category_id' })
  category: ServiceCategory;
}
