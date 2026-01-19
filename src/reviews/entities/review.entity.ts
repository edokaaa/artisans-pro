// reviews/entities/review.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from 'src/common/entities/soft-delete.entity';
import { ReviewStars } from 'src/common/enums/review-stars.enum';
import { Client } from 'src/users/entities/client.entity';
import { ServiceProvider } from 'src/users/entities/service-provider.entity';
import { RequestedService } from 'src/jobs/entities/requested-service.entity';

@Entity('reviews')
export class Review extends SoftDeleteEntity {
  @Column({ type: 'enum', enum: ReviewStars })
  stars: ReviewStars;

  @Column('text')
  comment: string;

  @Column()
  chargedMore: boolean;

  @Column()
  timely: boolean;

  @Column()
  wasProfessional: boolean;

  @Column()
  wasSuspicious: boolean;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client | null;

  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @OneToOne(() => RequestedService)
  @JoinColumn({ name: 'requested_service_id' })
  requestedService: RequestedService;
}
