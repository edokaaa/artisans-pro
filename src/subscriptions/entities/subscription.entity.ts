import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { ServiceProvider } from '../../users/entities/service-provider.entity';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
@Index(['serviceProvider', 'status'])
export class Subscription extends SoftDeleteEntity {
  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'subscription_plan_id' })
  plan: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date;

  // Payment linkage
  @Column({ type: 'uuid', nullable: true, unique: true })
  paymentSessionId?: string;
}
