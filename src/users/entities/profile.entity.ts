import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column()
  name: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_profiles_location', { synchronize: false })
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
