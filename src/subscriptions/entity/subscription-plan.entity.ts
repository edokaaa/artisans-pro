import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPackage } from './subscription-package.entity';
import { Profile } from 'src/providers/entity/profile.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  profile: Profile;

  @ManyToOne(() => SubscriptionPackage, { onDelete: 'CASCADE' })
  package: SubscriptionPackage;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  renewMonthly: boolean;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
