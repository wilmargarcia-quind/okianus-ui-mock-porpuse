import type { Client, Product, Tank, InventoryBalance, Movement, Report, User } from '@/types'
import { subDays, format } from 'date-fns'

// ── USERS ──────────────────────────────────────────────────────────────────
export const mockUsers: (User & { password: string })[] = [
  { id: 'USR-001', email: 'admin@okianus.com', password: 'admin123', name: 'Administrador Okianus', role: 'ADMIN' },
  { id: 'USR-002', email: 'operador@okianus.com', password: 'op123', name: 'Carlos Mendoza', role: 'OPERATOR' },
  { id: 'USR-003', email: 'operador2@okianus.com', password: 'op123', name: 'María Torres', role: 'OPERATOR' },
  { id: 'USR-004', email: 'bioenergia@cliente.com', password: 'cli123', name: 'BioEnergía S.A.', role: 'CLIENT', clientId: 'CLI-001', clientName: 'BioEnergía S.A.' },
  { id: 'USR-005', email: 'petroandina@cliente.com', password: 'cli123', name: 'PetroAndina LTDA', role: 'CLIENT', clientId: 'CLI-002', clientName: 'PetroAndina LTDA' },
  { id: 'USR-006', email: 'palmasnorte@cliente.com', password: 'cli123', name: 'Palmas del Norte', role: 'CLIENT', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.' },
  { id: 'USR-007', email: 'caribe@cliente.com', password: 'cli123', name: 'Combustibles del Caribe', role: 'CLIENT', clientId: 'CLI-004', clientName: 'Combustibles del Caribe' },
  { id: 'USR-008', email: 'refineria@cliente.com', password: 'cli123', name: 'Refinería Costa', role: 'CLIENT', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.' },
]

// ── CLIENTS ────────────────────────────────────────────────────────────────
export const mockClients: Client[] = [
  { id: 'CLI-001', code: 'CLI-001', name: 'BioEnergía S.A.', email: 'bioenergia@cliente.com', active: true, usersCount: 2 },
  { id: 'CLI-002', code: 'CLI-002', name: 'PetroAndina LTDA', email: 'petroandina@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-003', code: 'CLI-003', name: 'Palmas del Norte S.A.S.', email: 'palmasnorte@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-004', code: 'CLI-004', name: 'Combustibles del Caribe', email: 'caribe@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-005', code: 'CLI-005', name: 'Refinería Costa S.A.', email: 'refineria@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-006', code: 'CLI-006', name: 'Agro Industrial del Golfo', email: 'agrogolfo@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-007', code: 'CLI-007', name: 'Energía Verde Colombia', email: 'energiaverde@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-008', code: 'CLI-008', name: 'Distribuidora Nacional', email: 'disnacional@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-009', code: 'CLI-009', name: 'Petrochemicals S.A.S.', email: 'petrochem@cliente.com', active: true, usersCount: 1 },
  { id: 'CLI-010', code: 'CLI-010', name: 'Terminal Atlántico LTDA', email: 'terminlatl@cliente.com', active: true, usersCount: 1 },
]

// ── PRODUCTS ───────────────────────────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: 'PROD-001', code: 'PROD-001', name: 'Aceite de Palma', active: true,
    qualities: [
      { id: 'Q-PA-A', code: 'Q-A', name: 'Alta Pureza', description: 'FFA < 3%', active: true, productId: 'PROD-001' },
      { id: 'Q-PA-B', code: 'Q-B', name: 'Estándar', description: 'FFA 3–5%', active: true, productId: 'PROD-001' },
      { id: 'Q-PA-C', code: 'Q-C', name: 'Industrial', description: 'FFA > 5%', active: true, productId: 'PROD-001' },
    ],
  },
  {
    id: 'PROD-002', code: 'PROD-002', name: 'GLP (Gas Licuado de Petróleo)', active: true,
    qualities: [
      { id: 'Q-GLP-A', code: 'Q-A', name: 'Propano Puro', description: 'Pureza > 99%', active: true, productId: 'PROD-002' },
      { id: 'Q-GLP-B', code: 'Q-B', name: 'Mezcla Comercial', description: 'Propano–Butano', active: true, productId: 'PROD-002' },
    ],
  },
]

// ── TANKS ──────────────────────────────────────────────────────────────────
export const mockTanks: Tank[] = [
  { id: 'TQ-001', code: 'TQ-001', name: 'Tanque Norte 1', capacity: 2000, status: 'active' },
  { id: 'TQ-002', code: 'TQ-002', name: 'Tanque Norte 2', capacity: 2000, status: 'active' },
  { id: 'TQ-003', code: 'TQ-003', name: 'Tanque Sur 1',   capacity: 3500, status: 'active' },
  { id: 'TQ-004', code: 'TQ-004', name: 'Tanque Sur 2',   capacity: 3500, status: 'active' },
  { id: 'TQ-005', code: 'TQ-005', name: 'Tanque GLP-A',   capacity: 1200, status: 'active' },
  { id: 'TQ-006', code: 'TQ-006', name: 'Tanque GLP-B',   capacity: 1200, status: 'maintenance' },
]

// ── INVENTORY BALANCES ─────────────────────────────────────────────────────
export const mockInventoryBalances: InventoryBalance[] = [
  { id: 'INV-001', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',       productId: 'PROD-001', productName: 'Aceite de Palma',          qualityId: 'Q-PA-A',  qualityName: 'Alta Pureza',     balance: 1850.500, lastMovementDate: new Date('2026-04-22'), status: 'OK' },
  { id: 'INV-002', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',       productId: 'PROD-001', productName: 'Aceite de Palma',          qualityId: 'Q-PA-B',  qualityName: 'Estándar',        balance:  420.000, lastMovementDate: new Date('2026-04-21'), status: 'OK' },
  { id: 'INV-003', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',       productId: 'PROD-002', productName: 'GLP (Gas Licuado)',        qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    balance:  380.200, lastMovementDate: new Date('2026-04-20'), status: 'OK' },
  { id: 'INV-004', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',      productId: 'PROD-001', productName: 'Aceite de Palma',          qualityId: 'Q-PA-C',  qualityName: 'Industrial',      balance: 2100.750, lastMovementDate: new Date('2026-04-23'), status: 'OK' },
  { id: 'INV-005', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',      productId: 'PROD-002', productName: 'GLP (Gas Licuado)',        qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial',balance:  615.000, lastMovementDate: new Date('2026-04-22'), status: 'OK' },
  { id: 'INV-006', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',productId: 'PROD-001', productName: 'Aceite de Palma',         qualityId: 'Q-PA-A',  qualityName: 'Alta Pureza',     balance:  980.300, lastMovementDate: new Date('2026-04-21'), status: 'OK' },
  { id: 'INV-007', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',productId: 'PROD-001', productName: 'Aceite de Palma',         qualityId: 'Q-PA-B',  qualityName: 'Estándar',        balance:  210.000, lastMovementDate: new Date('2026-04-19'), status: 'OK' },
  { id: 'INV-008', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',productId: 'PROD-002', productName: 'GLP (Gas Licuado)',       qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    balance:  450.100, lastMovementDate: new Date('2026-04-22'), status: 'OK' },
  { id: 'INV-009', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',productId: 'PROD-002', productName: 'GLP (Gas Licuado)',       qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial',balance:  280.500, lastMovementDate: new Date('2026-04-18'), status: 'OK' },
  { id: 'INV-010', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',  productId: 'PROD-001', productName: 'Aceite de Palma',          qualityId: 'Q-PA-A',  qualityName: 'Alta Pureza',     balance: 1200.000, lastMovementDate: new Date('2026-04-23'), status: 'OK' },
  { id: 'INV-011', clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo',productId: 'PROD-001', productName: 'Aceite de Palma',       qualityId: 'Q-PA-C',  qualityName: 'Industrial',      balance:  750.200, lastMovementDate: new Date('2026-04-20'), status: 'OK' },
  { id: 'INV-012', clientId: 'CLI-007', clientName: 'Energía Verde Colombia', productId: 'PROD-002', productName: 'GLP (Gas Licuado)',       qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    balance:  320.000, lastMovementDate: new Date('2026-04-17'), status: 'OK' },
  { id: 'INV-013', clientId: 'CLI-008', clientName: 'Distribuidora Nacional', productId: 'PROD-001', productName: 'Aceite de Palma',         qualityId: 'Q-PA-B',  qualityName: 'Estándar',        balance:  890.400, lastMovementDate: new Date('2026-04-21'), status: 'OK' },
  { id: 'INV-014', clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.', productId: 'PROD-002', productName: 'GLP (Gas Licuado)',        qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial',balance:  445.000, lastMovementDate: new Date('2026-04-19'), status: 'OK' },
  { id: 'INV-015', clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA',productId: 'PROD-001', productName: 'Aceite de Palma',         qualityId: 'Q-PA-A',  qualityName: 'Alta Pureza',     balance: 1100.000, lastMovementDate: new Date('2026-04-22'), status: 'OK' },
]

// ── MOVEMENTS (deterministic — no Math.random()) ───────────────────────────
const BASE = new Date('2026-04-23')
const d = (daysAgo: number) => subDays(BASE, daysAgo)

export const mockMovements: Movement[] = [
  // Apr 23 (today)
  { id: 'MOV-001', date: d(0), type: 'ENTRADA', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',    productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 600.000, previousBalance:  600.000, newBalance: 1200.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-002', date: d(0), type: 'SALIDA',  clientId: 'CLI-002', clientName: 'PetroAndina LTDA',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',       tons: 250.000, previousBalance: 2350.750, newBalance: 2100.750, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 22
  { id: 'MOV-003', date: d(1), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',         productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 500.000, previousBalance: 1350.500, newBalance: 1850.500, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-004', date: d(1), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',        productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 215.000, previousBalance:  400.000, newBalance:  615.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-005', date: d(1), type: 'SALIDA',  clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',  productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons:  90.000, previousBalance:  300.000, newBalance:  210.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 21
  { id: 'MOV-006', date: d(2), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',         productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 420.000, previousBalance:      0.000, newBalance:  420.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-007', date: d(2), type: 'SALIDA',  clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',  productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 200.000, previousBalance: 1180.300, newBalance:  980.300, userId: 'USR-003', userName: 'María Torres',   notes: null },
  { id: 'MOV-008', date: d(2), type: 'ENTRADA', clientId: 'CLI-008', clientName: 'Distribuidora Nacional',   productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 890.400, previousBalance:      0.000, newBalance:  890.400, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  // Apr 20
  { id: 'MOV-009', date: d(3), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',         productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    tons: 380.200, previousBalance:      0.000, newBalance:  380.200, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-010', date: d(3), type: 'ENTRADA', clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',       tons: 750.200, previousBalance:      0.000, newBalance:  750.200, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 19
  { id: 'MOV-011', date: d(4), type: 'SALIDA',  clientId: 'CLI-002', clientName: 'PetroAndina LTDA',        productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 185.000, previousBalance:  800.000, newBalance:  615.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-012', date: d(4), type: 'ENTRADA', clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.',   productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 445.000, previousBalance:      0.000, newBalance:  445.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 18
  { id: 'MOV-013', date: d(5), type: 'AJUSTE',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe', productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 280.500, previousBalance:  282.000, newBalance:  280.500, userId: 'USR-001', userName: 'Administrador Okianus', notes: 'Ajuste por merma de almacenamiento — dictamen laboratorio #LAB-2026-041' },
  { id: 'MOV-014', date: d(5), type: 'ENTRADA', clientId: 'CLI-004', clientName: 'Combustibles del Caribe', productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    tons: 300.000, previousBalance:  150.100, newBalance:  450.100, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  // Apr 17
  { id: 'MOV-015', date: d(6), type: 'ENTRADA', clientId: 'CLI-007', clientName: 'Energía Verde Colombia',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',    tons: 320.000, previousBalance:      0.000, newBalance:  320.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-016', date: d(6), type: 'SALIDA',  clientId: 'CLI-001', clientName: 'BioEnergía S.A.',         productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 150.000, previousBalance: 1500.500, newBalance: 1350.500, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 16
  { id: 'MOV-017', date: d(7), type: 'ENTRADA', clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 1100.000,previousBalance:      0.000, newBalance: 1100.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-018', date: d(7), type: 'SALIDA',  clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',    productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 100.000, previousBalance:  700.000, newBalance:  600.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 15
  { id: 'MOV-019', date: d(8), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',       tons: 800.000, previousBalance: 1550.750, newBalance: 2350.750, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-020', date: d(8), type: 'SALIDA',  clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',      tons: 120.000, previousBalance:  870.200, newBalance:  750.200, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 14
  { id: 'MOV-021', date: d(9), type: 'ENTRADA', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',  productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 380.000, previousBalance:  800.300, newBalance: 1180.300, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-022', date: d(9), type: 'SALIDA',  clientId: 'CLI-007', clientName: 'Energía Verde Colombia',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons:  80.000, previousBalance:  400.000, newBalance:  320.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 13
  { id: 'MOV-023', date: d(10), type: 'ENTRADA', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',   productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 400.000, previousBalance:  300.000, newBalance:  700.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-024', date: d(10), type: 'AJUSTE',  clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons: 200.000, previousBalance:  198.000, newBalance:  200.000, userId: 'USR-001', userName: 'Administrador Okianus', notes: 'Corrección por calibración de medidor de flujo' },
  // Apr 12
  { id: 'MOV-025', date: d(11), type: 'ENTRADA', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',        tons: 300.000, previousBalance:      0.000, newBalance:  300.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-026', date: d(11), type: 'SALIDA',  clientId: 'CLI-008', clientName: 'Distribuidora Nacional',  productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',        tons: 180.000, previousBalance: 1070.400, newBalance:  890.400, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 11
  { id: 'MOV-027', date: d(12), type: 'ENTRADA', clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons: 200.000, previousBalance:      0.000, newBalance:  200.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-028', date: d(12), type: 'SALIDA',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe', productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',  tons: 100.000, previousBalance:  550.100, newBalance:  450.100, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 10
  { id: 'MOV-029', date: d(13), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons: 600.000, previousBalance:      0.000, newBalance:  600.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-030', date: d(13), type: 'SALIDA',  clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',     tons: 250.000, previousBalance: 1350.000, newBalance: 1100.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 09
  { id: 'MOV-031', date: d(14), type: 'ENTRADA', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',   productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 780.000, previousBalance:  300.000, newBalance: 1080.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-032', date: d(14), type: 'SALIDA',  clientId: 'CLI-001', clientName: 'BioEnergía S.A.',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',        tons: 310.000, previousBalance:  730.000, newBalance:  420.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 08
  { id: 'MOV-033', date: d(15), type: 'ENTRADA', clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',  tons: 1200.000, previousBalance:      0.000, newBalance: 1200.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-034', date: d(15), type: 'SALIDA',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe', productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 420.000, previousBalance:  700.000, newBalance:  280.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 07
  { id: 'MOV-035', date: d(16), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',      tons: 950.000, previousBalance:  600.750, newBalance: 1550.750, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-036', date: d(16), type: 'SALIDA',  clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 280.000, previousBalance:  725.000, newBalance:  445.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 06
  { id: 'MOV-037', date: d(17), type: 'ENTRADA', clientId: 'CLI-007', clientName: 'Energía Verde Colombia',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',  tons: 480.000, previousBalance:      0.000, newBalance:  480.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-038', date: d(17), type: 'SALIDA',  clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 160.000, previousBalance:  960.300, newBalance:  800.300, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 05
  { id: 'MOV-039', date: d(18), type: 'ENTRADA', clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 1350.000, previousBalance:      0.000, newBalance: 1350.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-040', date: d(18), type: 'SALIDA',  clientId: 'CLI-008', clientName: 'Distribuidora Nacional', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 530.000, previousBalance: 1600.400, newBalance: 1070.400, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 04
  { id: 'MOV-041', date: d(19), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 720.000, previousBalance:  780.500, newBalance: 1500.500, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-042', date: d(19), type: 'SALIDA',  clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons: 340.000, previousBalance:  940.000, newBalance:  600.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 03
  { id: 'MOV-043', date: d(20), type: 'ENTRADA', clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',   productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 400.000, previousBalance:      0.000, newBalance:  400.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-044', date: d(20), type: 'SALIDA',  clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',  tons: 330.000, previousBalance: 1200.000, newBalance:  870.200, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 02
  { id: 'MOV-045', date: d(21), type: 'ENTRADA', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',   tons: 700.000, previousBalance:      0.000, newBalance:  700.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-046', date: d(21), type: 'SALIDA',  clientId: 'CLI-007', clientName: 'Energía Verde Colombia',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',  tons: 220.000, previousBalance:  700.000, newBalance:  480.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Apr 01
  { id: 'MOV-047', date: d(22), type: 'ENTRADA', clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',       tons: 960.000, previousBalance:      0.000, newBalance:  960.300, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-048', date: d(22), type: 'SALIDA',  clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 610.000, previousBalance: 1960.000, newBalance: 1350.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 31
  { id: 'MOV-049', date: d(23), type: 'ENTRADA', clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 570.000, previousBalance:  155.000, newBalance:  725.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-050', date: d(23), type: 'SALIDA',  clientId: 'CLI-001', clientName: 'BioEnergía S.A.',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 420.000, previousBalance: 1200.500, newBalance:  780.500, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 30
  { id: 'MOV-051', date: d(24), type: 'ENTRADA', clientId: 'CLI-008', clientName: 'Distribuidora Nacional', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 1600.400, previousBalance:      0.000, newBalance: 1600.400, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-052', date: d(24), type: 'SALIDA',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe',productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 500.000, previousBalance: 1200.000, newBalance:  700.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 29
  { id: 'MOV-053', date: d(25), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',      tons: 850.000, previousBalance:      0.000, newBalance:  850.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-054', date: d(25), type: 'SALIDA',  clientId: 'CLI-005', clientName: 'Refinería Costa S.A.',   productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 280.000, previousBalance:  680.000, newBalance:  400.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 28
  { id: 'MOV-055', date: d(26), type: 'ENTRADA', clientId: 'CLI-006', clientName: 'Agro Industrial del Golfo', productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro', tons: 940.000, previousBalance:      0.000, newBalance:  940.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-056', date: d(26), type: 'SALIDA',  clientId: 'CLI-003', clientName: 'Palmas del Norte S.A.S.',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 390.000, previousBalance:  780.000, newBalance:  390.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 27
  { id: 'MOV-057', date: d(27), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',        productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 1200.500, previousBalance:      0.000, newBalance: 1200.500, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-058', date: d(27), type: 'SALIDA',  clientId: 'CLI-009', clientName: 'Petrochemicals S.A.S.',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-B', qualityName: 'Mezcla Comercial', tons: 370.000, previousBalance:  525.000, newBalance:  155.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 26
  { id: 'MOV-059', date: d(28), type: 'ENTRADA', clientId: 'CLI-010', clientName: 'Terminal Atlántico LTDA',productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-A', qualityName: 'Alta Pureza',      tons: 1960.000, previousBalance:      0.000, newBalance: 1960.000, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-060', date: d(28), type: 'SALIDA',  clientId: 'CLI-007', clientName: 'Energía Verde Colombia',  productId: 'PROD-002', productName: 'GLP (Gas Licuado)', qualityId: 'Q-GLP-A', qualityName: 'Propano Puro',  tons: 460.000, previousBalance: 1160.000, newBalance:  700.000, userId: 'USR-003', userName: 'María Torres',   notes: null },
  // Mar 25
  { id: 'MOV-061', date: d(29), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina LTDA',       productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-C', qualityName: 'Industrial',      tons: 1550.750, previousBalance:      0.000, newBalance: 1550.750, userId: 'USR-002', userName: 'Carlos Mendoza', notes: null },
  { id: 'MOV-062', date: d(29), type: 'SALIDA',  clientId: 'CLI-008', clientName: 'Distribuidora Nacional', productId: 'PROD-001', productName: 'Aceite de Palma', qualityId: 'Q-PA-B', qualityName: 'Estándar',         tons: 680.000, previousBalance: 2280.000, newBalance: 1600.400, userId: 'USR-003', userName: 'María Torres',   notes: null },
]

// ── REPORTS ────────────────────────────────────────────────────────────────
const generateReports = (): Report[] => {
  const reports: Report[] = []
  for (let i = 0; i < 23; i++) {
    const date = subDays(BASE, i)
    let status: Report['status']
    if (i === 0) status = 'PENDIENTE'
    else if (i === 1) status = 'GENERADO'
    else status = 'ENVIADO'
    reports.push({
      id: `RPT-${format(date, 'yyyyMMdd')}`,
      date,
      status,
      clientsIncluded: 10,
    })
  }
  return reports
}
export const mockReports: Report[] = generateReports()

// ── HELPERS ────────────────────────────────────────────────────────────────
export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function formatTons(n: number): string {
  return formatNumber(n, 3) + ' t'
}

// ── DASHBOARD HELPERS ─────────────────────────────────────────────────────
export function getDashboardStats() {
  const totalInventory = mockInventoryBalances.reduce((s, b) => s + b.balance, 0)
  const today = format(BASE, 'yyyy-MM-dd')
  const todayMovements = mockMovements.filter(m => format(m.date, 'yyyy-MM-dd') === today).length
  const TOTAL_CAPACITY = 13400
  return {
    totalInventory,
    activeClients: mockClients.filter(c => c.active).length,
    todayMovements,
    capacityUsed: Math.round((totalInventory / TOTAL_CAPACITY) * 100),
    inventoryTrend: 2.3,
  }
}

export function getMovementChartData() {
  // 30 days of deterministic daily aggregates
  const dailyData: Record<string, { date: string; entrada: number; salida: number; ajuste: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const key = format(subDays(BASE, i), 'dd/MM')
    dailyData[key] = { date: key, entrada: 0, salida: 0, ajuste: 0 }
  }
  for (const m of mockMovements) {
    const key = format(m.date, 'dd/MM')
    if (dailyData[key]) {
      if (m.type === 'ENTRADA') dailyData[key].entrada += m.tons
      else if (m.type === 'SALIDA') dailyData[key].salida += m.tons
      else dailyData[key].ajuste += m.tons
    }
  }
  return Object.values(dailyData)
}

export function getProductDistribution() {
  const grouped: Record<string, { name: string; value: number; color: string }> = {}
  const COLORS: Record<string, string> = {
    'Q-PA-A':  '#0D2137',
    'Q-PA-B':  '#1565C0',
    'Q-PA-C':  '#1E88E5',
    'Q-GLP-A': '#E65100',
    'Q-GLP-B': '#FF8F00',
  }
  for (const b of mockInventoryBalances) {
    const key = `${b.productName.split('(')[0].trim()} ${b.qualityName}`
    if (!grouped[key]) grouped[key] = { name: key, value: 0, color: COLORS[b.qualityId] ?? '#9BAEC8' }
    grouped[key].value += b.balance
  }
  return Object.values(grouped).sort((a, b) => b.value - a.value)
}

export function getClientBalances() {
  const grouped: Record<string, { clientName: string; palma: number; glp: number; total: number }> = {}
  for (const b of mockInventoryBalances) {
    if (!grouped[b.clientId]) grouped[b.clientId] = { clientName: b.clientName, palma: 0, glp: 0, total: 0 }
    if (b.productId === 'PROD-001') grouped[b.clientId].palma += b.balance
    else grouped[b.clientId].glp += b.balance
    grouped[b.clientId].total += b.balance
  }
  return Object.values(grouped).sort((a, b) => b.total - a.total)
}

// Client-specific: deterministic history based on their movements
export function getClientMovementHistory(clientId: string) {
  const result: { date: string; total: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const day = subDays(BASE, i)
    const dayStr = format(day, 'dd/MM')
    const movsUpToDay = mockMovements.filter(m => m.clientId === clientId && m.date <= day)
    // Use last known newBalance
    const lastMov = movsUpToDay.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
    result.push({ date: dayStr, total: lastMov ? lastMov.newBalance : 0 })
  }
  return result
}

// Client reports: real aggregated data
export function getClientDailyReports(clientId: string) {
  const reports = []
  for (let i = 0; i < 23; i++) {
    const date = subDays(BASE, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayMovs = mockMovements.filter(m => m.clientId === clientId && format(m.date, 'yyyy-MM-dd') === dateStr)
    const entries = dayMovs.filter(m => m.type === 'ENTRADA').reduce((s, m) => s + m.tons, 0)
    const exits = dayMovs.filter(m => m.type === 'SALIDA').reduce((s, m) => s + m.tons, 0)
    const clientBalances = mockInventoryBalances.filter(b => b.clientId === clientId)
    const totalNow = clientBalances.reduce((s, b) => s + b.balance, 0)
    const initialBalance = i === 0 ? totalNow - entries + exits : totalNow + (i * 50)
    reports.push({
      id: `RPT-${clientId}-${format(date, 'yyyyMMdd')}`,
      date,
      status: (i === 0 ? 'PENDIENTE' : i === 1 ? 'GENERADO' : 'ENVIADO') as Report['status'],
      clientsIncluded: 1,
      initialBalance: Math.max(0, initialBalance),
      entries,
      exits,
      finalBalance: Math.max(0, initialBalance + entries - exits),
    })
  }
  return reports
}
