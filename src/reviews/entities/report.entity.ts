// reviews/entities/report.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from 'src/common/entities/soft-delete.entity';
import { Client } from 'src/users/entities/client.entity';
import { ServiceProvider } from 'src/users/entities/service-provider.entity';

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
