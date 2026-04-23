import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { MovementsModule } from '../movements/movements.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [InventoryModule, MovementsModule, ClientsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
