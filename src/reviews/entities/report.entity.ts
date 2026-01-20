import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import { Client } from '../../users/entities/client.entity';
import { ServiceProvider } from '../../users/entities/service-provider.entity';

@Entity('reports')
export class Report extends SoftDeleteEntity {
  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @Column({ nullable: true })
  comment?: string;
}
