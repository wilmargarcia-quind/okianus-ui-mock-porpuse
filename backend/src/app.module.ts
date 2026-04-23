import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { TanksModule } from './tanks/tanks.module';
import { InventoryModule } from './inventory/inventory.module';
import { MovementsModule } from './movements/movements.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'okianus'),
        password: config.get('DB_PASSWORD', 'okianus2026'),
        database: config.get('DB_DATABASE', 'okianus_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // auto-create tables in dev
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    TanksModule,
    InventoryModule,
    MovementsModule,
    ReportsModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
