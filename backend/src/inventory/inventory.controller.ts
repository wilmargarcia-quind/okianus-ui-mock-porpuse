import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Request() req: any) {
    if (req.user.role === UserRole.CLIENT) {
      return this.inventoryService.findByClient(req.user.clientId);
    }
    return this.inventoryService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.inventoryService.findByClient(clientId);
  }
}
