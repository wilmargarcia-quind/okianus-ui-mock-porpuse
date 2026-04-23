import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { MovementType, UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard)
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() dto: CreateMovementDto, @CurrentUser() user: User) {
    return this.movementsService.create(dto, user);
  }

  @Get()
  findAll(
    @Query('clientId') clientId: string,
    @Query('type') type: MovementType,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @CurrentUser() user: User,
  ) {
    const clientFilter = user.role === UserRole.CLIENT ? (user.clientId ?? undefined) : clientId;
    return this.movementsService.findAll({
      clientId: clientFilter,
      type,
      from,
      to,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('recent')
  findRecent(@Query('limit') limit: string) {
    return this.movementsService.findRecent(limit ? parseInt(limit) : 10);
  }

  @Get('trend')
  getTrend(@Query('days') days: string) {
    return this.movementsService.getTrend(days ? parseInt(days) : 30);
  }
}
