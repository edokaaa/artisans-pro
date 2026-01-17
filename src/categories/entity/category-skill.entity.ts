import { ServiceProvider } from 'src/providers/entity/service-provider.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceCategory } from './category.entity';
import { Skill } from './skill.entity';

@Entity('service_category_skills')
export class ServiceCategorySkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ServiceProvider, { onDelete: 'CASCADE' })
  serviceProvider: ServiceProvider;

  @ManyToOne(() => ServiceCategory, { onDelete: 'CASCADE' })
  category: ServiceCategory;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  skill: Skill;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
