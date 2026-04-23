import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepo.find({
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['client'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email }, relations: ['client'] });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('El email ya está registrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, passwordHash });
    return this.usersRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (dto.password) {
      (dto as any).passwordHash = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async updateLastLogin(id: string) {
    await this.usersRepo.update(id, { lastLogin: new Date() });
  }

  sanitize(user: User) {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
