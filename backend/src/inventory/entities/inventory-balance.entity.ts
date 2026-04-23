import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Product } from '../../products/entities/product.entity';
import { Quality } from '../../products/entities/quality.entity';

@Entity('inventory_balances')
@Unique(['clientId', 'productId', 'qualityId'])
export class InventoryBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({
    name: 'balance_tons',
    type: 'numeric',
    precision: 15,
    scale: 3,
    default: 0,
  })
  balanceTons: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
