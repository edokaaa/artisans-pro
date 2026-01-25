import { Entity, Column, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import { Subscription } from './subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends SoftDeleteEntity {
  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // NGN

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: 30 })
  durationInDays: number; // monthly = 30

  @Column({ default: true })
  isActive: boolean;

  // Feature limits (extensible)
  @Column({ type: 'jsonb', nullable: true })
  features?: {
    maxJobs?: number;
    priorityListing?: boolean;
  };

  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions: Subscription[];
}
