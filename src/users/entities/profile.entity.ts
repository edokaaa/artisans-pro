import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseGeoEntity } from '../../common/entities/base.entity';

@Entity('profiles')
export class Profile extends BaseGeoEntity {
  @Column()
  name: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
