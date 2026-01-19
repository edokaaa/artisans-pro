// categories/entities/service-category.entity.ts
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { ServiceCategorySkill } from './service-category-skill.entity';

@Entity('service_categories')
export class ServiceCategory extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @OneToMany(() => ServiceCategorySkill, (skill) => skill.category)
  skills: ServiceCategorySkill[];
}
