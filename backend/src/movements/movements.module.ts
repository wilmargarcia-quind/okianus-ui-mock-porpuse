import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movement } from './entities/movement.entity';
import { InventoryBalance } from '../inventory/entities/inventory-balance.entity';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, InventoryBalance])],
  providers: [MovementsService],
  controllers: [MovementsController],
  exports: [MovementsService],
})
export class MovementsModule {}
