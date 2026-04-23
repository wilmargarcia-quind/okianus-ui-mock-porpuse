import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Quality } from './quality.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Quality, (q) => q.product, { cascade: true, eager: true })
  qualities: Quality[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
