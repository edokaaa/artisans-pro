import { SoftDeleteEntity } from '../../common/entities/soft-delete.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { IdType } from '../../common/enums/id-type.enum';
import { VerificationStatus } from '../../common/enums/verification-status.enum';
import { ServiceCategorySkill } from '../../categories/entities/service-category-skill.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('service_providers')
export class ServiceProvider extends SoftDeleteEntity {
  @OneToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column('text', { array: true })
  workPhotoUrls: string[];

  @Column({ type: 'enum', enum: IdType })
  idType: IdType;

  @Column()
  idNumber: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column()
  idPhotoFrontUrl: string;

  @Column({ nullable: true })
  idPhotoBackUrl?: string;

  @Column()
  selfieUrl: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  verificationFailureReason?: string;

  @Column({ default: true })
  available: boolean;

  @Column()
  phoneNumber: string;

  @Column({ default: false })
  phoneNumberVerified: boolean;

  @ManyToMany(() => ServiceCategorySkill, { cascade: true })
  @JoinTable({
    name: 'service_provider_skills',
    joinColumn: { name: 'service_provider_id' },
    inverseJoinColumn: { name: 'service_category_skill_id' },
  })
  skills: ServiceCategorySkill[];

  @OneToMany(() => Review, (review) => review.serviceProvider)
  reviews: Review[];

  // Virtual field - populated by query
  averageRating?: number;
}
