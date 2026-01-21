import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import { ReviewStars } from '../../common/enums/review-stars.enum';
import { Client } from '../../users/entities/client.entity';
import { ServiceProvider } from '../../users/entities/service-provider.entity';
import { RequestedService } from '../../jobs/entities/requested-service.entity';
import { ReviewReply } from './review-reply.entity';

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

  @OneToOne(() => ReviewReply)
  @JoinColumn({ name: 'reply_id' })
  reply: ReviewReply;
}
