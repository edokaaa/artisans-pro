import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  /**
   * External ID from User Service
   */
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'timestamptz' })
  lastSyncedAt: Date;
}
