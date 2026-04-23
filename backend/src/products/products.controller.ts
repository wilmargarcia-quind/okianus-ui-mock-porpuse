import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateQualityDto, UpdateQualityDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('qualities')
  findAllQualities(@Query('productId') productId?: string) {
    if (productId) return this.productsService.findQualitiesByProduct(productId);
    return this.productsService.findAllQualities();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Post('qualities')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createQuality(@Body() dto: CreateQualityDto) {
    return this.productsService.createQuality(dto);
  }

  @Patch('qualities/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateQuality(@Param('id') id: string, @Body() dto: UpdateQualityDto) {
    return this.productsService.updateQuality(id, dto);
  }

  @Patch('qualities/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleQuality(@Param('id') id: string) {
    return this.productsService.toggleQualityStatus(id);
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleProduct(@Param('id') id: string) {
    return this.productsService.toggleProductStatus(id);
  }
}
