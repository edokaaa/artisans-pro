import { Skill } from "src/categories/entity/skill.entity";
import { ServiceProvider } from "src/providers/entity/service-provider.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => ServiceProvider, sp => sp.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ServiceProvider;

  @ManyToOne(() => Skill, { nullable: true })
  @JoinColumn({ name: 'skill_id' })
  skill?: Skill;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'double precision', default: 0 })
  price: number;

  @Column({ default: false })
  visible: boolean;

  @Column({ default: false })
  uses_escrow: boolean;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: object;

  @Column({ type: 'json', nullable: true })
  location_json?: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
