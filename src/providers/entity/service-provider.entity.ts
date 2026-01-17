import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ServiceProviderPhoto } from "./service-provider-photo.entity";
import { ServiceCategory } from "src/categories/entity/category.entity";
import { Profile } from "./profile.entity";
import { Service } from "src/services/entity/service.entity";

@Entity('service_providers')
export class ServiceProvider {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => ServiceCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory;

  @OneToOne(() => Profile, p => p.service_provider)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  company_name: string;

  @Column()
  availability_time_from: string;

  @Column({ nullable: true })
  availability_time_to?: string;

  @Column({ nullable: true })
  availability_interval?: string;

  @Column({ type: 'int', nullable: true })
  country_id?: number;

  @Column({ type: 'int', nullable: true })
  state_id?: number;

  @Column({ type: 'int', nullable: true })
  city_id?: number;

  @Column({ nullable: true })
  id_type?: string;

  @Column({ nullable: true })
  id_number?: string;

  @Column({ nullable: true })
  id_image?: string;

  @Column({ nullable: true })
  id_image_secondary?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ nullable: true })
  selfie?: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ServiceProviderPhoto, p => p.provider)
  photos: ServiceProviderPhoto[];

  @OneToMany(() => Service, s => s.provider)
  services: Service[];
}
