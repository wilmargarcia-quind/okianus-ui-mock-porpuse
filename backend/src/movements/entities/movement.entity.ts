import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn,
} from 'typeorm';
import { MovementType } from '../../common/enums';
import { Client } from '../../clients/entities/client.entity';
import { Product } from '../../products/entities/product.entity';
import { Quality } from '../../products/entities/quality.entity';
import { User } from '../../users/entities/user.entity';

@Entity('movements')
export class Movement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', enum: MovementType })
  type: MovementType;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quality_id' })
  qualityId: string;

  @ManyToOne(() => Quality, { eager: true })
  @JoinColumn({ name: 'quality_id' })
  quality: Quality;

  @Column({ type: 'numeric', precision: 15, scale: 3 })
  tons: number;

  @Column({ name: 'balance_before', type: 'numeric', precision: 15, scale: 3 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'numeric', precision: 15, scale: 3 })
  balanceAfter: number;

  @Column({ nullable: true })
  notes?: string | null;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
