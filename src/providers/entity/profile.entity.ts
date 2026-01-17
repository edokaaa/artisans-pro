import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ServiceProvider } from "./service-provider.entity";
import { ServiceRequest } from "src/services/entity/service-request.entity";
import { User } from "src/users/entity/user.entity";

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: ['individual', 'service-provider'],
    default: 'individual',
  })
  user_type: 'individual' | 'service-provider';

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  phone_otp?: string;

  @Column({ type: 'timestamp', nullable: true })
  phone_verified_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /* relations */

  @OneToOne(() => ServiceProvider, sp => sp.profile)
  service_provider: ServiceProvider;

  @OneToMany(() => ServiceRequest, sr => sr.client)
  requested_services: ServiceRequest[];

  @OneToOne(() => User, u => u.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
