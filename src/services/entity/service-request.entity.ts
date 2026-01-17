import { Profile } from "src/providers/entity/profile.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Service } from "./service.entity";
import { ServiceProvider } from "src/providers/entity/service-provider.entity";

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'client_id' })
  client: Profile;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'provider_id' })
  provider: ServiceProvider;

  @Column({ type: 'timestamp' })
  scheduled_date_time: Date;

  @Column({ type: 'text' })
  task_description: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 'pending' })
  payment_status: string;

  @Column({ default: true })
  provider_action_required: boolean;

  @Column({ default: false })
  client_action_required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
