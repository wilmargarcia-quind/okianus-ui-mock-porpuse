import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { Quality } from '../products/entities/quality.entity';
import { Tank } from '../tanks/entities/tank.entity';
import { InventoryBalance } from '../inventory/entities/inventory-balance.entity';
import { Movement } from '../movements/entities/movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Product, Quality, Tank, InventoryBalance, Movement]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}
