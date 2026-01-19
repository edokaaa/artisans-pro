import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @Column()
  fullName: string;

  @OneToOne(() => Profile, { eager: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
