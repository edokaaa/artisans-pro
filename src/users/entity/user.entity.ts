import { Profile } from "src/providers/entity/profile.entity";
import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string; // from user service

  @Column()
  email: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column()
  role: 'freelancer' | 'client';

  @Column({ default: true })
  isActive: boolean;

  @Column()
  syncedAt: Date;

  // relations

  @OneToOne(() => Profile, p => p.user)
  profile: Profile;

}
