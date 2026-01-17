import { Profile } from "src/providers/entity/profile.entity";
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

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => ServiceProvider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ServiceProvider;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Profile;

  @Column()
  reason: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
