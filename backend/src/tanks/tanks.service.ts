import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tank } from './entities/tank.entity';

@Injectable()
export class TanksService {
  constructor(
    @InjectRepository(Tank)
    private readonly tanksRepo: Repository<Tank>,
  ) {}

  findAll() {
    return this.tanksRepo.find({ order: { code: 'ASC' } });
  }

  create(dto: Partial<Tank>) {
    return this.tanksRepo.save(this.tanksRepo.create(dto));
  }

  async update(id: string, dto: Partial<Tank>) {
    await this.tanksRepo.update(id, dto);
    return this.tanksRepo.findOne({ where: { id } });
  }
}
