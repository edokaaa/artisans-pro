import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { ServiceCategory } from "./category.entity";

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => ServiceCategory)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column()
  title: string;

  @Column()
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
