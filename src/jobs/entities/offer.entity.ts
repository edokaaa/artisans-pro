import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import { OfferStatus } from '../../common/enums/offer-status.enum';
import { Client } from '../../users/entities/client.entity';
import { ServiceProvider } from '../../users/entities/service-provider.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('offers')
export class Offer extends SoftDeleteEntity {
  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text')
  taskDescription: string;

  @Column({ default: false })
  useEscrow: boolean;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;

  @Column({
    nullable: true,
  })
  escrowStatus?: string;

  @Column({
    nullable: true,
  })
  cancellationReason?: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;
}
