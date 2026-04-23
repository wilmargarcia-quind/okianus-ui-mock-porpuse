import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Quality } from './entities/quality.entity';
import { CreateProductDto, CreateQualityDto, UpdateQualityDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Quality)
    private readonly qualitiesRepo: Repository<Quality>,
  ) {}

  findAll() {
    return this.productsRepo.find({ order: { name: 'ASC' } });
  }

  findAllQualities() {
    return this.qualitiesRepo.find({ where: { isActive: true }, relations: ['product'] });
  }

  async findQualitiesByProduct(productId: string) {
    return this.qualitiesRepo.find({ where: { productId, isActive: true } });
  }

  async createProduct(dto: CreateProductDto) {
    return this.productsRepo.save(this.productsRepo.create(dto));
  }

  async createQuality(dto: CreateQualityDto) {
    return this.qualitiesRepo.save(this.qualitiesRepo.create(dto));
  }

  async updateQuality(id: string, dto: UpdateQualityDto) {
    const q = await this.qualitiesRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Calidad no encontrada');
    Object.assign(q, dto);
    return this.qualitiesRepo.save(q);
  }

  async toggleQualityStatus(id: string) {
    const q = await this.qualitiesRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Calidad no encontrada');
    q.isActive = !q.isActive;
    return this.qualitiesRepo.save(q);
  }

  async toggleProductStatus(id: string) {
    const p = await this.productsRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    p.isActive = !p.isActive;
    return this.productsRepo.save(p);
  }
}
