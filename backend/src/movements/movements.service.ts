import {
  Injectable, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { InventoryBalance } from '../inventory/entities/inventory-balance.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementType, UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

export interface MovementsFilter {
  clientId?: string;
  type?: MovementType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementsRepo: Repository<Movement>,
    @InjectRepository(InventoryBalance)
    private readonly balancesRepo: Repository<InventoryBalance>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateMovementDto, user: User): Promise<Movement> {
    // CLIENT role can only register movements for their own client
    if (user.role === UserRole.CLIENT && user.clientId !== dto.clientId) {
      throw new ForbiddenException('No puede registrar movimientos de otro cliente');
    }

    return this.dataSource.transaction(async (manager) => {
      // Lock the balance row for update
      let balance = await manager.findOne(InventoryBalance, {
        where: {
          clientId: dto.clientId,
          productId: dto.productId,
          qualityId: dto.qualityId,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        balance = manager.create(InventoryBalance, {
          clientId: dto.clientId,
          productId: dto.productId,
          qualityId: dto.qualityId,
          balanceTons: 0,
        });
        balance = await manager.save(balance);
      }

      const balanceBefore = Number(balance.balanceTons);
      let balanceAfter: number;

      switch (dto.type) {
        case MovementType.ENTRADA:
          balanceAfter = balanceBefore + Number(dto.tons);
          break;
        case MovementType.SALIDA:
          balanceAfter = balanceBefore - Number(dto.tons);
          if (balanceAfter < 0) {
            throw new BadRequestException(
              `Saldo insuficiente. Disponible: ${balanceBefore.toFixed(3)} t`,
            );
          }
          break;
        case MovementType.AJUSTE:
          balanceAfter = Number(dto.tons);
          break;
      }

      if (balanceAfter < 0) {
        throw new BadRequestException('El saldo no puede ser negativo');
      }

      balance.balanceTons = balanceAfter;
      await manager.save(balance);

      const movement = manager.create(Movement, {
        type: dto.type,
        clientId: dto.clientId,
        productId: dto.productId,
        qualityId: dto.qualityId,
        tons: dto.tons,
        balanceBefore,
        balanceAfter,
        notes: dto.notes,
        createdById: user.id,
      });

      return manager.save(movement);
    });
  }

  async findAll(filter: MovementsFilter = {}) {
    const { clientId, type, from, to, page = 1, limit = 20 } = filter;

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (type) where.type = type;
    if (from && to) {
      where.createdAt = Between(new Date(from), new Date(to + 'T23:59:59'));
    }

    const [data, total] = await this.movementsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  findRecent(limit = 10) {
    return this.movementsRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTrend(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const movements = await this.movementsRepo.find({
      where: { createdAt: Between(since, new Date()) },
      order: { createdAt: 'ASC' },
      select: ['type', 'tons', 'createdAt'],
    });

    // Group by date
    const grouped: Record<string, { date: string; ENTRADA: number; SALIDA: number; AJUSTE: number }> = {};

    for (const m of movements) {
      const date = m.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, ENTRADA: 0, SALIDA: 0, AJUSTE: 0 };
      grouped[date][m.type] += Number(m.tons);
    }

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }
}
