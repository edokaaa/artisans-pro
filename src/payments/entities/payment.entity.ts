import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum PaymentPurpose {
  SUBSCRIPTION = 'subscription',
  OFFER = 'offer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('payments')
@Index(['sessionId'], { unique: true })
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  sessionId: string; // from payment service

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentPurpose,
  })
  purpose: PaymentPurpose;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  reference?: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;
}
