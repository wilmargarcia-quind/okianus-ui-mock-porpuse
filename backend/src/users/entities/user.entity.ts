import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { Client } from '../../clients/entities/client.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', enum: UserRole, default: UserRole.OPERATOR })
  role: UserRole;

  @Column({ name: 'client_id', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { nullable: true, eager: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
