import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Skill } from "./skill.entity";

@Entity('categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Skill, s => s.category)
  skills: Skill[];
}
