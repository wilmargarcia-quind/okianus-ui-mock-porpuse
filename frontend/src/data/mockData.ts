import type {
  User, Client, Product, Tank, Movement, InventoryBalance, Report,
  DashboardStats, ChartDataPoint, ProductDistribution, ClientBalance,
  SpaceLoan, Driver, DriverRegistration, Turn, PatioRecord, ChecklistItem,
  WeighingRecord, BayOperation, ParticipationConfig, VehicleCycleStatus,
  KpiPhaseTime, BayOccupancy,
} from '@/types'

// ─── USERS ───────────────────────────────────────────────────────────────────

export const mockUsers: (User & { password: string })[] = [
  { id: 'u1', email: 'admin@okianus.com',      password: 'admin123', name: 'Wilmer Hernández',   role: 'ADMIN' },
  { id: 'u2', email: 'operador@okianus.com',   password: 'op123',    name: 'Carlos Mendoza',     role: 'OPERATOR' },
  { id: 'u3', email: 'operador2@okianus.com',  password: 'op123',    name: 'Ana Rojas',          role: 'OPERATOR' },
  { id: 'u4', email: 'bioe@cliente.com',       password: 'cli123',   name: 'Laura Gómez',        role: 'CLIENT', clientId: 'CLI-001', clientName: 'BioEnergía S.A.' },
  { id: 'u5', email: 'petro@cliente.com',      password: 'cli123',   name: 'Ricardo Palomino',   role: 'CLIENT', clientId: 'CLI-002', clientName: 'PetroAndina Ltda.' },
  { id: 'u6', email: 'palmas@cliente.com',     password: 'cli123',   name: 'Sofía Vargas',       role: 'CLIENT', clientId: 'CLI-003', clientName: 'Palmas del Norte' },
  { id: 'u7', email: 'combus@cliente.com',     password: 'cli123',   name: 'Marcos Díaz',        role: 'CLIENT', clientId: 'CLI-004', clientName: 'Combustibles del Caribe' },
  { id: 'u8', email: 'refineria@cliente.com',  password: 'cli123',   name: 'Elena Torres',       role: 'CLIENT', clientId: 'CLI-005', clientName: 'Refinería Costa' },
]

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

export const mockClients: Client[] = [
  { id: 'CLI-001', code: 'CLI-001', name: 'BioEnergía S.A.',            email: 'ops@bioenergia.com',        phone: '3001234501', active: true,  usersCount: 2 },
  { id: 'CLI-002', code: 'CLI-002', name: 'PetroAndina Ltda.',           email: 'inventario@petroandina.co', phone: '3001234502', active: true,  usersCount: 1 },
  { id: 'CLI-003', code: 'CLI-003', name: 'Palmas del Norte',            email: 'logistica@palmasnorte.com', phone: '3001234503', active: true,  usersCount: 3 },
  { id: 'CLI-004', code: 'CLI-004', name: 'Combustibles del Caribe',     email: 'ops@combustiblescar.com',   phone: '3001234504', active: true,  usersCount: 2 },
  { id: 'CLI-005', code: 'CLI-005', name: 'Refinería Costa',             email: 'inv@refineriacosta.co',     phone: '3001234505', active: true,  usersCount: 1 },
  { id: 'CLI-006', code: 'CLI-006', name: 'Aceites del Pacífico',        email: 'ops@aceitespac.com',        phone: '3001234506', active: true,  usersCount: 2 },
  { id: 'CLI-007', code: 'CLI-007', name: 'GLP Occidente S.A.S.',        email: 'logistica@glpocc.com',      phone: '3001234507', active: true,  usersCount: 1 },
  { id: 'CLI-008', code: 'CLI-008', name: 'Termales Energía',            email: 'inv@termalesenergia.co',    phone: '3001234508', active: false, usersCount: 1 },
  { id: 'CLI-009', code: 'CLI-009', name: 'Agroindustrial Bolívar',      email: 'ops@agrobolivar.com',       phone: '3001234509', active: true,  usersCount: 2 },
  { id: 'CLI-010', code: 'CLI-010', name: 'Distribuidora Nacional',      email: 'inv@distnacional.co',       phone: '3001234510', active: true,  usersCount: 1 },
]

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  {
    id: 'PRD-001', code: 'PALMA', name: 'Aceite de Palma', active: true,
    qualities: [
      { id: 'Q-001', code: 'AP', name: 'Alta Pureza',  description: 'Índice de acidez < 0.1%',    active: true, productId: 'PRD-001' },
      { id: 'Q-002', code: 'ST', name: 'Estándar',     description: 'Índice de acidez 0.1–0.5%',  active: true, productId: 'PRD-001' },
      { id: 'Q-003', code: 'IN', name: 'Industrial',   description: 'Índice de acidez > 0.5%',    active: true, productId: 'PRD-001' },
    ],
  },
  {
    id: 'PRD-002', code: 'GLP', name: 'GLP - Gas Licuado de Petróleo', active: true,
    qualities: [
      { id: 'Q-004', code: 'PP', name: 'Propano Puro',      description: 'Pureza > 99%',               active: true, productId: 'PRD-002' },
      { id: 'Q-005', code: 'MC', name: 'Mezcla Comercial',  description: 'Propano/Butano 60/40',        active: true, productId: 'PRD-002' },
    ],
  },
]

// ─── TANKS ───────────────────────────────────────────────────────────────────

export const mockTanks: Tank[] = [
  { id: 'TQ-001', code: 'TQ-001', name: 'Tanque Palma 1',  capacity: 2500, status: 'active' },
  { id: 'TQ-002', code: 'TQ-002', name: 'Tanque Palma 2',  capacity: 3000, status: 'active' },
  { id: 'TQ-003', code: 'TQ-003', name: 'Tanque Palma 3',  capacity: 2000, status: 'maintenance' },
  { id: 'TQ-004', code: 'TQ-004', name: 'Tanque GLP 1',    capacity: 1500, status: 'active' },
  { id: 'TQ-005', code: 'TQ-005', name: 'Tanque GLP 2',    capacity: 1200, status: 'active' },
  { id: 'TQ-006', code: 'TQ-006', name: 'Tanque Reserva',  capacity: 3500, status: 'inactive' },
]

// ─── INVENTORY BALANCES ──────────────────────────────────────────────────────

export const mockInventoryBalances: InventoryBalance[] = [
  { id: 'IB-001', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      balance: 312.5, lastMovementDate: new Date('2026-04-23'), status: 'OK'      },
  { id: 'IB-002', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         balance: 185.0, lastMovementDate: new Date('2026-04-22'), status: 'OK'      },
  { id: 'IB-003', clientId: 'CLI-002', clientName: 'PetroAndina Ltda.',         productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     balance: 88.0,  lastMovementDate: new Date('2026-04-23'), status: 'BAJO'    },
  { id: 'IB-004', clientId: 'CLI-003', clientName: 'Palmas del Norte',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      balance: 445.0, lastMovementDate: new Date('2026-04-21'), status: 'OK'      },
  { id: 'IB-005', clientId: 'CLI-003', clientName: 'Palmas del Norte',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-003', qualityName: 'Industrial',       balance: 120.0, lastMovementDate: new Date('2026-04-20'), status: 'OK'      },
  { id: 'IB-006', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',   productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-005', qualityName: 'Mezcla Comercial', balance: 210.0, lastMovementDate: new Date('2026-04-23'), status: 'OK'      },
  { id: 'IB-007', clientId: 'CLI-005', clientName: 'Refinería Costa',           productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         balance: 18.5,  lastMovementDate: new Date('2026-04-22'), status: 'CRITICO' },
  { id: 'IB-008', clientId: 'CLI-006', clientName: 'Aceites del Pacífico',      productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      balance: 275.0, lastMovementDate: new Date('2026-04-23'), status: 'OK'      },
  { id: 'IB-009', clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',      productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     balance: 156.5, lastMovementDate: new Date('2026-04-22'), status: 'OK'      },
  { id: 'IB-010', clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         balance: 390.0, lastMovementDate: new Date('2026-04-23'), status: 'OK'      },
]

// ─── SPACE LOANS ─────────────────────────────────────────────────────────────

export const mockSpaceLoans: SpaceLoan[] = [
  { id: 'SL-001', lenderId: 'CLI-003', lenderName: 'Palmas del Norte',        borrowerId: 'CLI-001', borrowerName: 'BioEnergía S.A.',        productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 50.0, date: new Date('2026-04-18'), status: 'ACTIVO',   notes: 'Acuerdo aprobado por ambas partes' },
  { id: 'SL-002', lenderId: 'CLI-006', lenderName: 'Aceites del Pacífico',    borrowerId: 'CLI-005', borrowerName: 'Refinería Costa',         productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 30.0, date: new Date('2026-04-20'), returnDate: new Date('2026-04-23'), status: 'DEVUELTO', notes: 'Devuelto según acuerdo' },
  { id: 'SL-003', lenderId: 'CLI-004', lenderName: 'Combustibles del Caribe', borrowerId: 'CLI-007', borrowerName: 'GLP Occidente S.A.S.',    productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-005', qualityName: 'Mezcla Comercial', tons: 25.0, date: new Date('2026-04-22'), status: 'ACTIVO',   notes: 'Préstamo urgente por déficit operativo' },
]

// ─── MOVEMENTS ───────────────────────────────────────────────────────────────

const BASE = new Date('2026-04-23')
function daysBack(d: number) { const dt = new Date(BASE); dt.setDate(dt.getDate() - d); return dt }
function todayAt(h: number, m: number) { const d = new Date(BASE); d.setHours(h, m, 0, 0); return d }

export const mockMovements: Movement[] = [
  { id: 'MOV-001', date: daysBack(0), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 45.0,  previousBalance: 267.5, newBalance: 312.5, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-002', date: daysBack(0), type: 'SALIDA',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe',  productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-005', qualityName: 'Mezcla Comercial', tons: 30.0,  previousBalance: 240.0, newBalance: 210.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-003', date: daysBack(0), type: 'ENTRADA', clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',   productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 60.0,  previousBalance: 330.0, newBalance: 390.0, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-004', date: daysBack(0), type: 'SALIDA',  clientId: 'CLI-006', clientName: 'Aceites del Pacífico',     productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 25.0,  previousBalance: 300.0, newBalance: 275.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-005', date: daysBack(1), type: 'ENTRADA', clientId: 'CLI-003', clientName: 'Palmas del Norte',         productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 80.0,  previousBalance: 365.0, newBalance: 445.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-006', date: daysBack(1), type: 'SALIDA',  clientId: 'CLI-005', clientName: 'Refinería Costa',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 40.0,  previousBalance: 58.5,  newBalance: 18.5,  userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-007', date: daysBack(1), type: 'AJUSTE',  clientId: 'CLI-002', clientName: 'PetroAndina Ltda.',         productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     tons: -2.0,  previousBalance: 90.0,  newBalance: 88.0,  userId: 'u1', userName: 'Wilmer Hernández', notes: 'Ajuste por diferencia en pesaje báscula — dictamen lab' },
  { id: 'MOV-008', date: daysBack(2), type: 'ENTRADA', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 55.0,  previousBalance: 130.0, newBalance: 185.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-009', date: daysBack(2), type: 'SALIDA',  clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',     productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     tons: 43.5,  previousBalance: 200.0, newBalance: 156.5, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-010', date: daysBack(2), type: 'ENTRADA', clientId: 'CLI-006', clientName: 'Aceites del Pacífico',     productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 75.0,  previousBalance: 225.0, newBalance: 300.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-011', date: daysBack(3), type: 'SALIDA',  clientId: 'CLI-003', clientName: 'Palmas del Norte',         productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-003', qualityName: 'Industrial',       tons: 30.0,  previousBalance: 150.0, newBalance: 120.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-012', date: daysBack(3), type: 'ENTRADA', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',  productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-005', qualityName: 'Mezcla Comercial', tons: 90.0,  previousBalance: 150.0, newBalance: 240.0, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-013', date: daysBack(4), type: 'ENTRADA', clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',   productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 110.0, previousBalance: 220.0, newBalance: 330.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-014', date: daysBack(4), type: 'SALIDA',  clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 35.0,  previousBalance: 302.5, newBalance: 267.5, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-015', date: daysBack(5), type: 'ENTRADA', clientId: 'CLI-002', clientName: 'PetroAndina Ltda.',         productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     tons: 40.0,  previousBalance: 50.0,  newBalance: 90.0,  userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-016', date: daysBack(5), type: 'SALIDA',  clientId: 'CLI-006', clientName: 'Aceites del Pacífico',     productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 50.0,  previousBalance: 275.0, newBalance: 225.0, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-017', date: daysBack(6), type: 'ENTRADA', clientId: 'CLI-005', clientName: 'Refinería Costa',          productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',         tons: 60.0,  previousBalance: -1.5,  newBalance: 58.5,  userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-018', date: daysBack(7), type: 'SALIDA',  clientId: 'CLI-004', clientName: 'Combustibles del Caribe',  productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-005', qualityName: 'Mezcla Comercial', tons: 60.0,  previousBalance: 210.0, newBalance: 150.0, userId: 'u3', userName: 'Ana Rojas',       notes: null },
  { id: 'MOV-019', date: daysBack(7), type: 'ENTRADA', clientId: 'CLI-003', clientName: 'Palmas del Norte',         productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',      tons: 95.0,  previousBalance: 270.0, newBalance: 365.0, userId: 'u2', userName: 'Carlos Mendoza',  notes: null },
  { id: 'MOV-020', date: daysBack(8), type: 'ENTRADA', clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',     productId: 'PRD-002', productName: 'GLP',             qualityId: 'Q-004', qualityName: 'Propano Puro',     tons: 70.0,  previousBalance: 130.0, newBalance: 200.0, userId: 'u3', userName: 'Ana Rojas',       notes: null },
]

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export const mockReports: Report[] = Array.from({ length: 23 }, (_, i) => {
  const d = daysBack(i)
  const status = i === 0 ? 'PENDIENTE' : i < 3 ? 'GENERADO' : 'ENVIADO'
  return {
    id: `RPT-${String(i + 1).padStart(3, '0')}`,
    date: d, status: status as Report['status'],
    clientsIncluded: 10,
    initialBalance: 2050 - i * 15,
    entries:         180  - i * 3,
    exits:           120  - i * 2,
    finalBalance:    2050 - i * 15 + (180 - i * 3) - (120 - i * 2),
  }
})

// ─── PARTICIPATION CONFIG ─────────────────────────────────────────────────────

export const mockParticipation: ParticipationConfig[] = [
  { id: 'PC-001', clientId: 'CLI-003', clientName: 'Palmas del Norte',         productType: 'ACEITE', percentage: 40, totalBays: 8, assignedBays: 3, slaHours: 4, active: true },
  { id: 'PC-002', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          productType: 'ACEITE', percentage: 20, totalBays: 8, assignedBays: 2, slaHours: 4, active: true },
  { id: 'PC-003', clientId: 'CLI-006', clientName: 'Aceites del Pacífico',     productType: 'ACEITE', percentage: 20, totalBays: 8, assignedBays: 2, slaHours: 4, active: true },
  { id: 'PC-004', clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',   productType: 'ACEITE', percentage: 20, totalBays: 8, assignedBays: 2, slaHours: 4, active: true },
  { id: 'PC-005', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',  productType: 'GLP',   percentage: 50, totalBays: 4, assignedBays: 2, slaHours: 3, active: true },
  { id: 'PC-006', clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',     productType: 'GLP',   percentage: 30, totalBays: 4, assignedBays: 1, slaHours: 3, active: true },
  { id: 'PC-007', clientId: 'CLI-002', clientName: 'PetroAndina Ltda.',         productType: 'GLP',   percentage: 20, totalBays: 4, assignedBays: 1, slaHours: 3, active: true },
]

// ─── DRIVERS ─────────────────────────────────────────────────────────────────

export const mockDrivers: Driver[] = [
  { id: 'DRV-001', cedula: '1001234567', name: 'Jorge',   lastName: 'Martínez',  licenseType: 'C2', phone: '3151234501', runtValidated: true  },
  { id: 'DRV-002', cedula: '1002345678', name: 'Luis',    lastName: 'García',    licenseType: 'C2', phone: '3151234502', runtValidated: true  },
  { id: 'DRV-003', cedula: '1003456789', name: 'Carlos',  lastName: 'Sánchez',   licenseType: 'C3', phone: '3151234503', runtValidated: true  },
  { id: 'DRV-004', cedula: '1004567890', name: 'Pedro',   lastName: 'López',     licenseType: 'C2', phone: '3151234504', runtValidated: true  },
  { id: 'DRV-005', cedula: '1005678901', name: 'Miguel',  lastName: 'Hernández', licenseType: 'C3', phone: '3151234505', runtValidated: false },
  { id: 'DRV-006', cedula: '1006789012', name: 'Andrés',  lastName: 'Torres',    licenseType: 'C2', phone: '3151234506', runtValidated: true  },
  { id: 'DRV-007', cedula: '1007890123', name: 'Roberto', lastName: 'Díaz',      licenseType: 'C2', phone: '3151234507', runtValidated: true  },
  { id: 'DRV-008', cedula: '1008901234', name: 'Felipe',  lastName: 'Vargas',    licenseType: 'C3', phone: '3151234508', runtValidated: true  },
]

// ─── DRIVER REGISTRATIONS (today) ────────────────────────────────────────────

export const mockDriverRegistrations: DriverRegistration[] = [
  {
    id: 'DR-001', clientId: 'CLI-003', clientName: 'Palmas del Norte',
    driver: mockDrivers[0], vehiclePlate: 'TTA-456', vehicleType: 'Cisterna', vehicleCapacity: 32,
    documents: [
      { type: 'SOAT', status: 'validado' }, { type: 'Tecnomecánica', status: 'validado' },
      { type: 'Tarjeta de Propiedad', status: 'validado' }, { type: 'Manifesto de Carga', status: 'cargado' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',
    requestedTons: 28.0, operationType: 'DESCARGUE', registeredAt: todayAt(6, 15), phase: 'COMPLETADO', turnNumber: 1,
  },
  {
    id: 'DR-002', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',
    driver: mockDrivers[1], vehiclePlate: 'LMN-789', vehicleType: 'Cisterna', vehicleCapacity: 30,
    documents: [
      { type: 'SOAT', status: 'validado' }, { type: 'Tecnomecánica', status: 'validado' },
      { type: 'Tarjeta de Propiedad', status: 'validado' }, { type: 'Manifesto de Carga', status: 'validado' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',
    requestedTons: 25.0, operationType: 'CARGUE', registeredAt: todayAt(6, 42), phase: 'EN_BAHIA', turnNumber: 2,
  },
  {
    id: 'DR-003', clientId: 'CLI-006', clientName: 'Aceites del Pacífico',
    driver: mockDrivers[2], vehiclePlate: 'BCD-321', vehicleType: 'Cisterna', vehicleCapacity: 28,
    documents: [
      { type: 'SOAT', status: 'validado' }, { type: 'Tecnomecánica', status: 'cargado' },
      { type: 'Tarjeta de Propiedad', status: 'validado' }, { type: 'Manifesto de Carga', status: 'pendiente' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',
    requestedTons: 22.0, operationType: 'CARGUE', registeredAt: todayAt(7, 5), phase: 'EN_PESAJE_INICIAL', turnNumber: 3,
  },
  {
    id: 'DR-004', clientId: 'CLI-004', clientName: 'Combustibles del Caribe',
    driver: mockDrivers[3], vehiclePlate: 'EFG-654', vehicleType: 'Tanque GLP', vehicleCapacity: 18,
    documents: [
      { type: 'SOAT', status: 'validado' }, { type: 'Tecnomecánica', status: 'validado' },
      { type: 'Tarjeta de Propiedad', status: 'validado' }, { type: 'Manifesto de Carga', status: 'validado' },
    ],
    productId: 'PRD-002', productName: 'GLP', qualityId: 'Q-005', qualityName: 'Mezcla Comercial',
    requestedTons: 15.0, operationType: 'CARGUE', registeredAt: todayAt(7, 28), phase: 'EN_PATIO', turnNumber: 4,
  },
  {
    id: 'DR-005', clientId: 'CLI-003', clientName: 'Palmas del Norte',
    driver: mockDrivers[4], vehiclePlate: 'HIJ-987', vehicleType: 'Cisterna', vehicleCapacity: 32,
    documents: [
      { type: 'SOAT', status: 'validado' }, { type: 'Tecnomecánica', status: 'pendiente' },
      { type: 'Tarjeta de Propiedad', status: 'cargado' }, { type: 'Manifesto de Carga', status: 'pendiente' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',
    requestedTons: 30.0, operationType: 'DESCARGUE', registeredAt: todayAt(7, 55), phase: 'CONFIRMADO', turnNumber: 5,
  },
  {
    id: 'DR-006', clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',
    driver: mockDrivers[5], vehiclePlate: 'KLM-147', vehicleType: 'Cisterna', vehicleCapacity: 30,
    documents: [
      { type: 'SOAT', status: 'cargado' }, { type: 'Tecnomecánica', status: 'cargado' },
      { type: 'Tarjeta de Propiedad', status: 'validado' }, { type: 'Manifesto de Carga', status: 'cargado' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-002', qualityName: 'Estándar',
    requestedTons: 26.0, operationType: 'CARGUE', registeredAt: todayAt(8, 10), phase: 'TURNO_ASIGNADO', turnNumber: 6,
  },
  {
    id: 'DR-007', clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',
    driver: mockDrivers[6], vehiclePlate: 'NOP-258', vehicleType: 'Tanque GLP', vehicleCapacity: 20,
    documents: [
      { type: 'SOAT', status: 'cargado' }, { type: 'Tecnomecánica', status: 'cargado' },
      { type: 'Tarjeta de Propiedad', status: 'cargado' }, { type: 'Manifesto de Carga', status: 'pendiente' },
    ],
    productId: 'PRD-002', productName: 'GLP', qualityId: 'Q-004', qualityName: 'Propano Puro',
    requestedTons: 18.0, operationType: 'CARGUE', registeredAt: todayAt(8, 35), phase: 'PRE_REGISTRO',
  },
  {
    id: 'DR-008', clientId: 'CLI-001', clientName: 'BioEnergía S.A.',
    driver: mockDrivers[7], vehiclePlate: 'QRS-369', vehicleType: 'Cisterna', vehicleCapacity: 28,
    documents: [
      { type: 'SOAT', status: 'pendiente' }, { type: 'Tecnomecánica', status: 'pendiente' },
      { type: 'Tarjeta de Propiedad', status: 'pendiente' }, { type: 'Manifesto de Carga', status: 'pendiente' },
    ],
    productId: 'PRD-001', productName: 'Aceite de Palma', qualityId: 'Q-001', qualityName: 'Alta Pureza',
    requestedTons: 24.0, operationType: 'CARGUE', registeredAt: todayAt(8, 52), phase: 'PRE_REGISTRO',
  },
]

// ─── TURNS ───────────────────────────────────────────────────────────────────

export const mockTurns: Turn[] = [
  { id: 'T-001', number: 1, clientId: 'CLI-003', clientName: 'Palmas del Norte',         clientParticipation: 40, driverName: 'Jorge Martínez',   driverCedula: '1001234567', vehiclePlate: 'TTA-456', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',      operationType: 'DESCARGUE', requestedTons: 28.0, assignedBay: 1, phase: 'COMPLETADO',          arrivalTime: todayAt(6, 15), confirmedAt: todayAt(6, 22), waitingMinutes: 7  },
  { id: 'T-002', number: 2, clientId: 'CLI-001', clientName: 'BioEnergía S.A.',          clientParticipation: 20, driverName: 'Luis García',      driverCedula: '1002345678', vehiclePlate: 'LMN-789', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',      operationType: 'CARGUE',    requestedTons: 25.0, assignedBay: 2, phase: 'EN_BAHIA',            arrivalTime: todayAt(6, 42), confirmedAt: todayAt(6, 50), waitingMinutes: 8  },
  { id: 'T-003', number: 3, clientId: 'CLI-006', clientName: 'Aceites del Pacífico',     clientParticipation: 20, driverName: 'Carlos Sánchez',   driverCedula: '1003456789', vehiclePlate: 'BCD-321', productName: 'Aceite de Palma', qualityName: 'Estándar',         operationType: 'CARGUE',    requestedTons: 22.0, assignedBay: 3, phase: 'EN_PESAJE_INICIAL',   arrivalTime: todayAt(7, 5),  confirmedAt: todayAt(7, 12), waitingMinutes: 7  },
  { id: 'T-004', number: 4, clientId: 'CLI-004', clientName: 'Combustibles del Caribe',  clientParticipation: 50, driverName: 'Pedro López',      driverCedula: '1004567890', vehiclePlate: 'EFG-654', productName: 'GLP',             qualityName: 'Mezcla Comercial', operationType: 'CARGUE',    requestedTons: 15.0, assignedBay: 5, phase: 'EN_PATIO',            arrivalTime: todayAt(7, 28), confirmedAt: todayAt(7, 35), waitingMinutes: 7  },
  { id: 'T-005', number: 5, clientId: 'CLI-003', clientName: 'Palmas del Norte',         clientParticipation: 40, driverName: 'Miguel Hernández', driverCedula: '1005678901', vehiclePlate: 'HIJ-987', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',      operationType: 'DESCARGUE', requestedTons: 30.0,             phase: 'CONFIRMADO',          arrivalTime: todayAt(7, 55), confirmedAt: todayAt(8, 2),  waitingMinutes: 32 },
  { id: 'T-006', number: 6, clientId: 'CLI-009', clientName: 'Agroindustrial Bolívar',   clientParticipation: 20, driverName: 'Andrés Torres',    driverCedula: '1006789012', vehiclePlate: 'KLM-147', productName: 'Aceite de Palma', qualityName: 'Estándar',         operationType: 'CARGUE',    requestedTons: 26.0,             phase: 'TURNO_ASIGNADO',      arrivalTime: todayAt(8, 10), waitingMinutes: 0  },
  { id: 'T-007', number: 7, clientId: 'CLI-007', clientName: 'GLP Occidente S.A.S.',     clientParticipation: 30, driverName: 'Roberto Díaz',     driverCedula: '1007890123', vehiclePlate: 'NOP-258', productName: 'GLP',             qualityName: 'Propano Puro',    operationType: 'CARGUE',    requestedTons: 18.0,             phase: 'PRE_REGISTRO',        arrivalTime: todayAt(8, 35), waitingMinutes: 0  },
]

// ─── CHECKLIST TEMPLATE ───────────────────────────────────────────────────────

export function defaultChecklist(allChecked = false): ChecklistItem[] {
  return [
    { id: 'CL-01', label: 'Cédula del conductor coincide con RUNT',         category: 'CONDUCTOR',  checked: allChecked, required: true  },
    { id: 'CL-02', label: 'Licencia de conducción vigente y correcta',      category: 'CONDUCTOR',  checked: allChecked, required: true  },
    { id: 'CL-03', label: 'Placa del vehículo coincide con solicitud',      category: 'VEHICULO',   checked: allChecked, required: true  },
    { id: 'CL-04', label: 'Estado general del vehículo aceptable',          category: 'VEHICULO',   checked: allChecked, required: true  },
    { id: 'CL-05', label: 'Cisterna limpia y sin contaminantes',            category: 'VEHICULO',   checked: allChecked, required: true  },
    { id: 'CL-06', label: 'Sellos del vehículo íntegros al ingreso',        category: 'VEHICULO',   checked: allChecked, required: true  },
    { id: 'CL-07', label: 'SOAT vigente',                                   category: 'DOCUMENTOS', checked: allChecked, required: true  },
    { id: 'CL-08', label: 'Tecnomecánica vigente',                          category: 'DOCUMENTOS', checked: allChecked, required: true  },
    { id: 'CL-09', label: 'Tarjeta de propiedad corresponde al vehículo',   category: 'DOCUMENTOS', checked: allChecked, required: true  },
    { id: 'CL-10', label: 'Manifesto de carga cargado en sistema',          category: 'DOCUMENTOS', checked: allChecked, required: true  },
    { id: 'CL-11', label: 'Equipo de seguridad presente (casco, guantes)',  category: 'SEGURIDAD',  checked: allChecked, required: true  },
    { id: 'CL-12', label: 'Extintor vigente en el vehículo',                category: 'SEGURIDAD',  checked: allChecked, required: false },
  ]
}

// ─── PATIO RECORDS ───────────────────────────────────────────────────────────

export const mockPatioRecords: PatioRecord[] = [
  {
    id: 'PR-001', turnId: 'T-004', turnNumber: 4,
    driverName: 'Pedro López', driverCedula: '1004567890', vehiclePlate: 'EFG-654',
    clientName: 'Combustibles del Caribe', productName: 'GLP', qualityName: 'Mezcla Comercial',
    operationType: 'CARGUE', requestedTons: 15.0, entryTime: todayAt(7, 42),
    checklist: defaultChecklist(true),
    qualityStatus: 'APROBADO', qualityLabNotes: 'Muestra conforme. Propano/Butano 60/40 verificado.',
    assignedBay: 5, status: 'APROBADO',
  },
  {
    id: 'PR-002', turnId: 'T-002', turnNumber: 2,
    driverName: 'Luis García', driverCedula: '1002345678', vehiclePlate: 'LMN-789',
    clientName: 'BioEnergía S.A.', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', requestedTons: 25.0, entryTime: todayAt(7, 5),
    checklist: defaultChecklist(true),
    qualityStatus: 'APROBADO', qualityLabNotes: 'Índice de acidez 0.08%. Aprobado.',
    assignedBay: 2, status: 'APROBADO',
  },
  {
    id: 'PR-003', turnId: 'T-003', turnNumber: 3,
    driverName: 'Carlos Sánchez', driverCedula: '1003456789', vehiclePlate: 'BCD-321',
    clientName: 'Aceites del Pacífico', productName: 'Aceite de Palma', qualityName: 'Estándar',
    operationType: 'CARGUE', requestedTons: 22.0, entryTime: todayAt(7, 55),
    checklist: defaultChecklist(false),
    qualityStatus: 'PENDIENTE', status: 'EN_CALIDAD',
  },
]

// ─── WEIGHING RECORDS ────────────────────────────────────────────────────────

export const mockWeighingRecords: WeighingRecord[] = [
  {
    id: 'WR-001', turnId: 'T-001', turnNumber: 1,
    vehiclePlate: 'TTA-456', driverName: 'Jorge Martínez',
    clientName: 'Palmas del Norte', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'DESCARGUE', requestedTons: 28.0, assignedBay: 1,
    initialWeight: 42.8, finalWeight: 14.9, netWeight: 27.9,
    status: 'COMPLETADO', initialWeightTime: todayAt(6, 28), finalWeightTime: todayAt(9, 15),
  },
  {
    id: 'WR-002', turnId: 'T-002', turnNumber: 2,
    vehiclePlate: 'LMN-789', driverName: 'Luis García',
    clientName: 'BioEnergía S.A.', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', requestedTons: 25.0, assignedBay: 2,
    initialWeight: 16.2, status: 'INICIAL_REGISTRADO', initialWeightTime: todayAt(7, 18),
  },
  {
    id: 'WR-003', turnId: 'T-003', turnNumber: 3,
    vehiclePlate: 'BCD-321', driverName: 'Carlos Sánchez',
    clientName: 'Aceites del Pacífico', productName: 'Aceite de Palma', qualityName: 'Estándar',
    operationType: 'CARGUE', requestedTons: 22.0,
    status: 'ESPERANDO_INICIAL',
  },
]

// ─── BAY OPERATIONS ──────────────────────────────────────────────────────────

export const mockBayOperations: BayOperation[] = [
  {
    id: 'BO-001', bay: 1, turnId: 'T-001', turnNumber: 1,
    vehiclePlate: 'TTA-456', driverName: 'Jorge Martínez',
    clientName: 'Palmas del Norte', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'DESCARGUE', tons: 27.9,
    status: 'SALIDA_AUTORIZADA', startTime: todayAt(6, 45), endTime: todayAt(9, 5),
    exitOrderNumber: 'SAL-2026-001', exitOrderGenerated: true, exitAuthorized: true, exitTime: todayAt(9, 22),
  },
  {
    id: 'BO-002', bay: 2, turnId: 'T-002', turnNumber: 2,
    vehiclePlate: 'LMN-789', driverName: 'Luis García',
    clientName: 'BioEnergía S.A.', productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', tons: 25.0,
    status: 'EN_PROCESO', startTime: todayAt(7, 35),
    exitOrderGenerated: false, exitAuthorized: false,
  },
  {
    id: 'BO-003', bay: 5, turnId: 'T-004', turnNumber: 4,
    vehiclePlate: 'EFG-654', driverName: 'Pedro López',
    clientName: 'Combustibles del Caribe', productName: 'GLP', qualityName: 'Mezcla Comercial',
    operationType: 'CARGUE', tons: 15.0,
    status: 'EN_PROCESO', startTime: todayAt(8, 10),
    exitOrderGenerated: false, exitAuthorized: false,
  },
]

// ─── BAY OCCUPANCY ────────────────────────────────────────────────────────────

export const mockBayOccupancy: BayOccupancy[] = [
  { bay: 1, status: 'libre' },
  { bay: 2, status: 'ocupada', clientName: 'BioEnergía S.A.',          operationType: 'CARGUE', startTime: todayAt(7, 35), progress: 65 },
  { bay: 3, status: 'libre' },
  { bay: 4, status: 'mantenimiento' },
  { bay: 5, status: 'ocupada', clientName: 'Combustibles del Caribe',  operationType: 'CARGUE', startTime: todayAt(8, 10), progress: 40 },
  { bay: 6, status: 'libre' },
  { bay: 7, status: 'libre' },
  { bay: 8, status: 'libre' },
]

// ─── VEHICLE CYCLES (client portal) ──────────────────────────────────────────

export const mockVehicleCycles: VehicleCycleStatus[] = mockDriverRegistrations
  .filter(dr => dr.clientId === 'CLI-001' || dr.clientId === 'CLI-003')
  .map(dr => {
    const turn = mockTurns.find(t => t.number === dr.turnNumber)
    const p = dr.phase
    const done  = (phases: string[]) => phases.includes(p) && p !== phases[phases.length - 1]
    const isNow = (phase: string) => p === phase
    const s = (phase: string, group: string[]): 'completed' | 'active' | 'pending' =>
      isNow(phase) ? 'active' : done(group) || !group.includes(p) && group.indexOf(phase) < group.indexOf(p) ? 'completed' : 'pending'

    const order = ['PRE_REGISTRO','TURNO_ASIGNADO','CONFIRMADO','EN_PATIO','EN_PESAJE_INICIAL','EN_BAHIA','COMPLETADO']
    const idx   = order.indexOf(p)

    return {
      turnId:        `T-00${dr.turnNumber ?? 0}`,
      turnNumber:     dr.turnNumber ?? 0,
      vehiclePlate:   dr.vehiclePlate,
      driverName:    `${dr.driver.name} ${dr.driver.lastName}`,
      clientId:       dr.clientId,
      clientName:     dr.clientName,
      operationType:  dr.operationType,
      productName:    dr.productName,
      qualityName:    dr.qualityName,
      requestedTons:  dr.requestedTons,
      currentPhase:   dr.phase,
      arrivalTime:    dr.registeredAt,
      phases: [
        { key: 'PRE_REGISTRO'      as const, label: 'Pre-registro',   icon: '📋', status: idx > 0 ? 'completed' : idx === 0 ? 'active' : 'pending', time: dr.registeredAt                                     },
        { key: 'TURNO_ASIGNADO'    as const, label: 'Turno asignado', icon: '🎫', status: idx > 1 ? 'completed' : idx === 1 ? 'active' : 'pending', time: turn?.confirmedAt                                   },
        { key: 'EN_PATIO'          as const, label: 'En patio',       icon: '🏭', status: idx > 3 ? 'completed' : idx === 3 ? 'active' : 'pending'                                                            },
        { key: 'EN_PESAJE_INICIAL' as const, label: 'Pesaje',         icon: '⚖️',  status: idx > 4 ? 'completed' : idx === 4 ? 'active' : 'pending'                                                            },
        { key: 'EN_BAHIA'          as const, label: 'En bahía',       icon: '🚢', status: idx > 5 ? 'completed' : idx === 5 ? 'active' : 'pending'                                                            },
        { key: 'COMPLETADO'        as const, label: 'Completado',     icon: '✅', status: idx === 6 ? 'completed' : 'pending'                                                                                   },
      ],
    }
  })

// ─── DASHBOARD HELPERS ────────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  return {
    totalInventory:  mockInventoryBalances.reduce((s, b) => s + b.balance, 0),
    activeClients:   mockClients.filter(c => c.active).length,
    todayMovements:  mockMovements.filter(m => m.date >= daysBack(0)).length,
    capacityUsed:    68,
    inventoryTrend:  4.2,
  }
}

export function getMovementChartData(): ChartDataPoint[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d    = daysBack(29 - i)
    const label = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    const seed  = i + 1
    return { date: label, entrada: Math.round(40 + (seed * 17) % 80), salida: Math.round(30 + (seed * 13) % 60), ajuste: Math.round((seed * 7) % 15) }
  })
}

export function getProductDistribution(): ProductDistribution[] {
  const palma = mockInventoryBalances.filter(b => b.productId === 'PRD-001').reduce((s, b) => s + b.balance, 0)
  const glp   = mockInventoryBalances.filter(b => b.productId === 'PRD-002').reduce((s, b) => s + b.balance, 0)
  return [
    { name: 'Aceite de Palma', value: Math.round(palma), color: '#1E88E5' },
    { name: 'GLP',             value: Math.round(glp),   color: '#E65100' },
  ]
}

export function getClientBalances(): ClientBalance[] {
  const COLORS = ['#1E88E5','#2E7D32','#E65100','#C62828','#6A1B9A','#F57F17','#00838F','#AD1457']
  return mockClients.filter(c => c.active).map((c, i) => ({
    clientName: c.name,
    balance:    mockInventoryBalances.filter(b => b.clientId === c.id).reduce((s, b) => s + b.balance, 0),
    color:      COLORS[i % COLORS.length],
  })).filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance)
}

export function getClientMovementHistory(_clientId: string): ChartDataPoint[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d    = daysBack(13 - i)
    const label = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    const seed  = (i + 5) % 30
    return { date: label, entrada: seed * 3 + 10, salida: seed * 2 + 5, ajuste: seed % 5 }
  })
}

export function getClientDailyReports(_clientId: string): Report[] {
  return mockReports.slice(0, 10)
}

export function getKpiPhaseTimes(): KpiPhaseTime[] {
  return [
    { phase: 'Turnamiento', avgMinutes: 8,  color: '#1E88E5' },
    { phase: 'Patio',       avgMinutes: 22, color: '#2E7D32' },
    { phase: 'Pesaje',      avgMinutes: 12, color: '#F57F17' },
    { phase: 'Bahía',       avgMinutes: 95, color: '#6A1B9A' },
    { phase: 'Salida',      avgMinutes: 15, color: '#00838F' },
  ]
}

export function getOperationalKpis() {
  return {
    vehiclesInPlant:   mockTurns.filter(t => !['COMPLETADO', 'PRE_REGISTRO'].includes(t.phase)).length,
    turnsWaiting:      mockTurns.filter(t => ['TURNO_ASIGNADO', 'CONFIRMADO'].includes(t.phase)).length,
    baysActive:        mockBayOccupancy.filter(b => b.status === 'ocupada').length,
    avgCycleMinutes:   152,
    completedToday:    mockTurns.filter(t => t.phase === 'COMPLETADO').length,
  }
}

// ─── FORMAT HELPERS ────────────────────────────────────────────────────────────

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatTons(value: number): string {
  return formatNumber(value, 1) + ' t'
}
