import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryBalance } from './entities/inventory-balance.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryBalance)
    private readonly balancesRepo: Repository<InventoryBalance>,
  ) {}

  findAll() {
    return this.balancesRepo.find({
      order: { client: { name: 'ASC' } } as any,
    });
  }

  findByClient(clientId: string) {
    return this.balancesRepo.find({
      where: { clientId },
      order: { product: { name: 'ASC' } } as any,
    });
  }

  async findOrCreate(clientId: string, productId: string, qualityId: string) {
    let balance = await this.balancesRepo.findOne({
      where: { clientId, productId, qualityId },
    });
    if (!balance) {
      balance = this.balancesRepo.create({ clientId, productId, qualityId, balanceTons: 0 });
      balance = await this.balancesRepo.save(balance);
    }
    return balance;
  }

  async getSummary() {
    const balances = await this.findAll();
    const total = balances.reduce((sum, b) => sum + Number(b.balanceTons), 0);
    const byProduct: Record<string, number> = {};
    for (const b of balances) {
      const key = `${b.product?.name} ${b.quality?.code}`;
      byProduct[key] = (byProduct[key] || 0) + Number(b.balanceTons);
    }
    return { total, byProduct, balances };
  }
}
