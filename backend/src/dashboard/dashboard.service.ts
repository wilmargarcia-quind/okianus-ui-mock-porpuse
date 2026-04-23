import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { MovementsService } from '../movements/movements.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly movementsService: MovementsService,
    private readonly clientsService: ClientsService,
  ) {}

  async getStats() {
    const [balances, clients, recentMovements] = await Promise.all([
      this.inventoryService.findAll(),
      this.clientsService.findActive(),
      this.movementsService.findRecent(100),
    ]);

    const totalTons = balances.reduce((s, b) => s + Number(b.balanceTons), 0);

    const today = new Date().toISOString().split('T')[0];
    const movementsToday = recentMovements.filter(
      (m) => m.createdAt.toISOString().split('T')[0] === today,
    ).length;

    // Capacity utilization (mock total capacity 13,400 t for 6 tanks)
    const totalCapacity = 13400;
    const capacityPct = ((totalTons / totalCapacity) * 100).toFixed(1);

    return {
      totalTons: Number(totalTons.toFixed(3)),
      activeClients: clients.length,
      movementsToday,
      capacityPct: Number(capacityPct),
      totalCapacity,
    };
  }

  async getChartData() {
    const [trend, summary] = await Promise.all([
      this.movementsService.getTrend(30),
      this.inventoryService.getSummary(),
    ]);

    // Build pie chart data
    const pieData = Object.entries(summary.byProduct).map(([name, value]) => ({
      name,
      value: Number(Number(value).toFixed(3)),
    }));

    // Build client bar chart data
    const allBalances = summary.balances;
    const clientTotals: Record<string, number> = {};
    for (const b of allBalances) {
      const name = b.client?.name || b.clientId;
      clientTotals[name] = (clientTotals[name] || 0) + Number(b.balanceTons);
    }
    const clientBarData = Object.entries(clientTotals)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(3)) }))
      .sort((a, b) => b.value - a.value);

    return { trend, pieData, clientBarData };
  }
}
