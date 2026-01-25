import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Offer } from '../../jobs/entities/offer.entity';

export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

@Entity('escrows')
export class Escrow extends BaseEntity {
  @OneToOne(() => Offer)
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.HELD,
  })
  status: EscrowStatus;

  @Column({ type: 'timestamptz', nullable: true })
  releasedAt?: Date;
}
