import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepo: Repository<Client>,
  ) {}

  findAll() {
    return this.clientsRepo.find({ order: { name: 'ASC' } });
  }

  findActive() {
    return this.clientsRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const client = await this.clientsRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async create(dto: CreateClientDto) {
    const exists = await this.clientsRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException('El código de cliente ya existe');
    return this.clientsRepo.save(this.clientsRepo.create(dto));
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.clientsRepo.save(client);
  }
}
