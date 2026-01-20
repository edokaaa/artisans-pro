import { ServiceCategorySkill } from 'src/categories/entities/service-category-skill.entity';
import { SoftDeleteEntity } from 'src/common/entities/soft-delete.entity';
import { ServiceProvider } from 'src/users/entities/service-provider.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('service_provider_jobs')
export class ServiceProviderJob extends SoftDeleteEntity {
  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @Column()
  name: string;

  @ManyToOne(() => ServiceCategorySkill)
  @JoinColumn({ name: 'service_category_skill_id' })
  skill: ServiceCategorySkill;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  @Column({ default: false })
  usesEscrow: boolean;

  @Column({ default: false })
  isActive: boolean;
}
