import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { Quality } from '../products/entities/quality.entity';
import { Tank } from '../tanks/entities/tank.entity';
import { InventoryBalance } from '../inventory/entities/inventory-balance.entity';
import { Movement } from '../movements/entities/movement.entity';
import { UserRole, MovementType } from '../common/enums';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Client) private clientsRepo: Repository<Client>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Quality) private qualitiesRepo: Repository<Quality>,
    @InjectRepository(Tank) private tanksRepo: Repository<Tank>,
    @InjectRepository(InventoryBalance) private balancesRepo: Repository<InventoryBalance>,
    @InjectRepository(Movement) private movementsRepo: Repository<Movement>,
  ) {}

  async run() {
    const existingAdmin = await this.usersRepo.findOne({ where: { email: 'admin@okianus.com' } });
    if (existingAdmin) {
      this.logger.log('Database already seeded. Skipping.');
      return { message: 'Already seeded' };
    }

    this.logger.log('Seeding database...');

    // 1. Products & Qualities
    const palma = await this.productsRepo.save(this.productsRepo.create({ code: 'PALMA', name: 'Aceite de Palma' }));
    const glp = await this.productsRepo.save(this.productsRepo.create({ code: 'GLP', name: 'GLP (Gas Licuado de Petróleo)' }));

    const palmaQA = await this.qualitiesRepo.save(this.qualitiesRepo.create({ productId: palma.id, code: 'Q-A', name: 'Alta Pureza', description: 'FFA < 3%' }));
    const palmaQB = await this.qualitiesRepo.save(this.qualitiesRepo.create({ productId: palma.id, code: 'Q-B', name: 'Estándar', description: 'FFA 3-5%' }));
    const palmaQC = await this.qualitiesRepo.save(this.qualitiesRepo.create({ productId: palma.id, code: 'Q-C', name: 'Industrial', description: 'FFA > 5%' }));
    const glpQA = await this.qualitiesRepo.save(this.qualitiesRepo.create({ productId: glp.id, code: 'Q-A', name: 'Propano Puro', description: 'Pureza > 99%' }));
    const glpQB = await this.qualitiesRepo.save(this.qualitiesRepo.create({ productId: glp.id, code: 'Q-B', name: 'Mezcla Comercial', description: 'Propano/Butano' }));

    // 2. Tanks
    const tankData = [
      { code: 'TQ-001', name: 'Tanque Norte 1', capacityTons: 2000 },
      { code: 'TQ-002', name: 'Tanque Norte 2', capacityTons: 2000 },
      { code: 'TQ-003', name: 'Tanque Sur 1', capacityTons: 3500 },
      { code: 'TQ-004', name: 'Tanque Sur 2', capacityTons: 3500 },
      { code: 'TQ-005', name: 'Tanque GLP-A', capacityTons: 1200 },
      { code: 'TQ-006', name: 'Tanque GLP-B', capacityTons: 1200 },
    ];
    await this.tanksRepo.save(tankData.map((t) => this.tanksRepo.create(t)));

    // 3. Clients (10)
    const clientsData = [
      { code: 'CLI-001', name: 'BioEnergía S.A.', email: 'bioenergia@cliente.com' },
      { code: 'CLI-002', name: 'PetroAndina LTDA', email: 'petroandina@cliente.com' },
      { code: 'CLI-003', name: 'Palmas del Norte S.A.S.', email: 'palmasnorte@cliente.com' },
      { code: 'CLI-004', name: 'Combustibles del Caribe', email: 'caribe@cliente.com' },
      { code: 'CLI-005', name: 'Refinería Costa S.A.', email: 'refineria@cliente.com' },
      { code: 'CLI-006', name: 'Agro Industrial del Golfo', email: 'agrogolfo@cliente.com' },
      { code: 'CLI-007', name: 'Energía Verde Colombia', email: 'energiaverde@cliente.com' },
      { code: 'CLI-008', name: 'Distribuidora Nacional', email: 'disnacional@cliente.com' },
      { code: 'CLI-009', name: 'Petrochemicals S.A.S.', email: 'petrochem@cliente.com' },
      { code: 'CLI-010', name: 'Terminal Atlántico LTDA', email: 'terminalatl@cliente.com' },
    ];
    const clients = await this.clientsRepo.save(clientsData.map((c) => this.clientsRepo.create(c)));
    const [bio, petro, palmas, caribe, refineria, agro, energia, disnac, petrochem, terminalatl] = clients;

    // 4. Users
    const adminHash = await bcrypt.hash('admin123', 10);
    const opHash = await bcrypt.hash('op123', 10);
    const cliHash = await bcrypt.hash('cli123', 10);

    const admin = await this.usersRepo.save(this.usersRepo.create({
      email: 'admin@okianus.com', passwordHash: adminHash, name: 'Administrador Okianus', role: UserRole.ADMIN,
    }));

    await this.usersRepo.save([
      this.usersRepo.create({ email: 'operador@okianus.com', passwordHash: opHash, name: 'Carlos Mendoza', role: UserRole.OPERATOR }),
      this.usersRepo.create({ email: 'operador2@okianus.com', passwordHash: opHash, name: 'María Torres', role: UserRole.OPERATOR }),
    ]);

    // Client users (one per client)
    await this.usersRepo.save([
      this.usersRepo.create({ email: 'bioenergia@cliente.com', passwordHash: cliHash, name: 'BioEnergía S.A.', role: UserRole.CLIENT, clientId: bio.id }),
      this.usersRepo.create({ email: 'petroandina@cliente.com', passwordHash: cliHash, name: 'PetroAndina LTDA', role: UserRole.CLIENT, clientId: petro.id }),
      this.usersRepo.create({ email: 'palmasnorte@cliente.com', passwordHash: cliHash, name: 'Palmas del Norte', role: UserRole.CLIENT, clientId: palmas.id }),
      this.usersRepo.create({ email: 'caribe@cliente.com', passwordHash: cliHash, name: 'Combustibles del Caribe', role: UserRole.CLIENT, clientId: caribe.id }),
      this.usersRepo.create({ email: 'refineria@cliente.com', passwordHash: cliHash, name: 'Refinería Costa', role: UserRole.CLIENT, clientId: refineria.id }),
    ]);

    // 5. Initial inventory balances
    const balancesData = [
      { clientId: bio.id, productId: palma.id, qualityId: palmaQA.id, balanceTons: 1850.500 },
      { clientId: bio.id, productId: palma.id, qualityId: palmaQB.id, balanceTons: 420.000 },
      { clientId: bio.id, productId: glp.id, qualityId: glpQA.id, balanceTons: 380.200 },
      { clientId: petro.id, productId: palma.id, qualityId: palmaQC.id, balanceTons: 2100.750 },
      { clientId: petro.id, productId: glp.id, qualityId: glpQB.id, balanceTons: 615.000 },
      { clientId: palmas.id, productId: palma.id, qualityId: palmaQA.id, balanceTons: 980.300 },
      { clientId: palmas.id, productId: palma.id, qualityId: palmaQB.id, balanceTons: 210.000 },
      { clientId: caribe.id, productId: glp.id, qualityId: glpQA.id, balanceTons: 450.100 },
      { clientId: caribe.id, productId: glp.id, qualityId: glpQB.id, balanceTons: 280.500 },
      { clientId: refineria.id, productId: palma.id, qualityId: palmaQA.id, balanceTons: 1200.000 },
      { clientId: agro.id, productId: palma.id, qualityId: palmaQC.id, balanceTons: 750.200 },
      { clientId: energia.id, productId: glp.id, qualityId: glpQA.id, balanceTons: 320.000 },
      { clientId: disnac.id, productId: palma.id, qualityId: palmaQB.id, balanceTons: 890.400 },
      { clientId: petrochem.id, productId: glp.id, qualityId: glpQB.id, balanceTons: 445.000 },
      { clientId: terminalatl.id, productId: palma.id, qualityId: palmaQA.id, balanceTons: 1100.000 },
    ];
    await this.balancesRepo.save(balancesData.map((b) => this.balancesRepo.create(b)));

    // 6. Historical movements (last 30 days for charts)
    const movDefs = [
      { daysAgo: 30, clientId: bio.id, productId: palma.id, qualityId: palmaQA.id, type: MovementType.ENTRADA, tons: 500, before: 1350.5, after: 1850.5 },
      { daysAgo: 28, clientId: petro.id, productId: palma.id, qualityId: palmaQC.id, type: MovementType.ENTRADA, tons: 800, before: 1300.75, after: 2100.75 },
      { daysAgo: 26, clientId: palmas.id, productId: palma.id, qualityId: palmaQA.id, type: MovementType.SALIDA, tons: 200, before: 1180.3, after: 980.3 },
      { daysAgo: 24, clientId: caribe.id, productId: glp.id, qualityId: glpQA.id, type: MovementType.ENTRADA, tons: 300, before: 150.1, after: 450.1 },
      { daysAgo: 22, clientId: refineria.id, productId: palma.id, qualityId: palmaQA.id, type: MovementType.ENTRADA, tons: 600, before: 600, after: 1200 },
      { daysAgo: 20, clientId: bio.id, productId: glp.id, qualityId: glpQA.id, type: MovementType.ENTRADA, tons: 380.2, before: 0, after: 380.2 },
      { daysAgo: 18, clientId: agro.id, productId: palma.id, qualityId: palmaQC.id, type: MovementType.ENTRADA, tons: 750.2, before: 0, after: 750.2 },
      { daysAgo: 16, clientId: petro.id, productId: glp.id, qualityId: glpQB.id, type: MovementType.SALIDA, tons: 185, before: 800, after: 615 },
      { daysAgo: 14, clientId: energia.id, productId: glp.id, qualityId: glpQA.id, type: MovementType.ENTRADA, tons: 320, before: 0, after: 320 },
      { daysAgo: 12, clientId: disnac.id, productId: palma.id, qualityId: palmaQB.id, type: MovementType.ENTRADA, tons: 890.4, before: 0, after: 890.4 },
      { daysAgo: 10, clientId: palmas.id, productId: palma.id, qualityId: palmaQB.id, type: MovementType.SALIDA, tons: 90, before: 300, after: 210 },
      { daysAgo: 8, clientId: petrochem.id, productId: glp.id, qualityId: glpQB.id, type: MovementType.ENTRADA, tons: 445, before: 0, after: 445 },
      { daysAgo: 6, clientId: terminalatl.id, productId: palma.id, qualityId: palmaQA.id, type: MovementType.ENTRADA, tons: 1100, before: 0, after: 1100 },
      { daysAgo: 4, clientId: caribe.id, productId: glp.id, qualityId: glpQB.id, type: MovementType.AJUSTE, tons: 280.5, before: 280.5, after: 280.5 },
      { daysAgo: 2, clientId: bio.id, productId: palma.id, qualityId: palmaQB.id, type: MovementType.ENTRADA, tons: 420, before: 0, after: 420 },
      { daysAgo: 1, clientId: refineria.id, productId: palma.id, qualityId: palmaQA.id, type: MovementType.SALIDA, tons: 100, before: 1300, after: 1200 },
    ];

    for (const m of movDefs) {
      const date = new Date();
      date.setDate(date.getDate() - m.daysAgo);
      const mov = this.movementsRepo.create({
        type: m.type,
        clientId: m.clientId,
        productId: m.productId,
        qualityId: m.qualityId,
        tons: m.tons,
        balanceBefore: m.before,
        balanceAfter: m.after,
        createdById: admin.id,
        notes: m.type === MovementType.AJUSTE ? 'Ajuste de inventario inicial' : null,
      });
      mov.createdAt = date;
      await this.movementsRepo.save(mov);
    }

    this.logger.log('Database seeded successfully!');
    return { message: 'Seeded successfully', clients: clients.length };
  }
}
