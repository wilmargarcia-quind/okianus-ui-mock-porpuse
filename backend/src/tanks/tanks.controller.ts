import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard)
@Controller('tanks')
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Get()
  findAll() {
    return this.tanksService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) {
    return this.tanksService.create(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.tanksService.update(id, body);
  }
}
