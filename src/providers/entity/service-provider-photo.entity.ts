import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ServiceProvider } from "./service-provider.entity";

@Entity('photos')
export class ServiceProviderPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => ServiceProvider, sp => sp.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ServiceProvider;

  @Column()
  image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
