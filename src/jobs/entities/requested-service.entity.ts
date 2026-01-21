// jobs/entities/requested-service.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ServiceProviderJob } from './service-provider-job.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { Client } from '../../users/entities/client.entity';
import { RequestStatus } from '../../common/enums/request-status.enum';

@Entity('requested_services')
export class RequestedService extends BaseEntity {
  @ManyToOne(() => ServiceProviderJob)
  @JoinColumn({ name: 'service_provider_job_id' })
  job: ServiceProviderJob;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('text')
  description: string;

  @Column({ default: false })
  isInstant: boolean;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ default: false })
  isRescheduled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  rescheduledDate?: Date;

  @Column({ nullable: true })
  rescheduledReason?: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Index('idx_requested_services_location', { synchronize: false })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}
