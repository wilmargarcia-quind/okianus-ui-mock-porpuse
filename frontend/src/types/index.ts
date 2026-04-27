export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  clientId?: string
  clientName?: string
  avatar?: string
}

export interface Client {
  id: string
  code: string
  name: string
  email: string
  phone?: string
  notes?: string
  active: boolean
  usersCount: number
}

export interface Product {
  id: string
  code: string
  name: string
  active: boolean
  qualities: Quality[]
}

export interface Quality {
  id: string
  code: string
  name: string
  description?: string
  active: boolean
  productId: string
}

export interface Tank {
  id: string
  code: string
  name: string
  capacity: number
  status: 'active' | 'maintenance' | 'inactive'
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export interface Movement {
  id: string
  date: Date
  type: MovementType
  clientId: string
  clientName: string
  productId: string
  productName: string
  qualityId: string
  qualityName: string
  tons: number
  previousBalance: number
  newBalance: number
  userId: string
  userName: string
  notes?: string | null
}

export interface InventoryBalance {
  id: string
  clientId: string
  clientName: string
  productId: string
  productName: string
  qualityId: string
  qualityName: string
  balance: number
  lastMovementDate: Date
  status: 'OK' | 'BAJO' | 'CRITICO'
}

export interface SpaceLoan {
  id: string
  lenderId: string
  lenderName: string
  borrowerId: string
  borrowerName: string
  productId: string
  productName: string
  qualityId: string
  qualityName: string
  tons: number
  date: Date
  returnDate?: Date
  status: 'ACTIVO' | 'DEVUELTO' | 'PENDIENTE'
  notes?: string
}

export interface Report {
  id: string
  date: Date
  status: 'PENDIENTE' | 'GENERADO' | 'ENVIADO' | 'FALLIDO'
  clientsIncluded: number
  initialBalance?: number
  entries?: number
  exits?: number
  finalBalance?: number
}

export interface DashboardStats {
  totalInventory: number
  activeClients: number
  todayMovements: number
  capacityUsed: number
  inventoryTrend: number
}

export interface ChartDataPoint {
  date: string
  entrada: number
  salida: number
  ajuste: number
}

export interface ProductDistribution {
  name: string
  value: number
  color: string
}

export interface ClientBalance {
  clientName: string
  balance: number
  color: string
}

// ─── OPERATIONAL CYCLE TYPES ───────────────────────────────────────────────

export type VehiclePhase =
  | 'PRE_REGISTRO'
  | 'TURNO_ASIGNADO'
  | 'CONFIRMADO'
  | 'EN_PATIO'
  | 'EN_PESAJE_INICIAL'
  | 'EN_BAHIA'
  | 'EN_PESAJE_FINAL'
  | 'ESPERANDO_SALIDA'
  | 'COMPLETADO'
  | 'RECHAZADO'

export type OperationType = 'CARGUE' | 'DESCARGUE'

export interface Driver {
  id: string
  cedula: string
  name: string
  lastName: string
  licenseType: 'C1' | 'C2' | 'C3' | 'CE'
  phone?: string
  runtValidated: boolean
}

export interface VehicleDoc {
  type: string
  status: 'pendiente' | 'cargado' | 'validado'
}

export interface DriverRegistration {
  id: string
  clientId: string
  clientName: string
  driver: Driver
  vehiclePlate: string
  vehicleType: string
  vehicleCapacity: number
  documents: VehicleDoc[]
  productId: string
  productName: string
  qualityId: string
  qualityName: string
  requestedTons: number
  operationType: OperationType
  registeredAt: Date
  phase: VehiclePhase
  turnNumber?: number
}

export interface Turn {
  id: string
  number: number
  clientId: string
  clientName: string
  clientParticipation: number
  driverName: string
  driverCedula: string
  vehiclePlate: string
  productName: string
  qualityName: string
  operationType: OperationType
  requestedTons: number
  assignedBay?: number
  phase: VehiclePhase
  arrivalTime: Date
  confirmedAt?: Date
  estimatedStart?: Date
  phaseStartTime?: Date
  waitingMinutes: number
}

export interface ChecklistItem {
  id: string
  label: string
  category: 'CONDUCTOR' | 'VEHICULO' | 'DOCUMENTOS' | 'SEGURIDAD'
  checked: boolean
  required: boolean
}

export interface PatioRecord {
  id: string
  turnId: string
  turnNumber: number
  driverName: string
  driverCedula: string
  vehiclePlate: string
  clientName: string
  productName: string
  qualityName: string
  operationType: OperationType
  requestedTons: number
  entryTime: Date
  checklist: ChecklistItem[]
  qualityStatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  qualityLabNotes?: string
  assignedBay?: number
  status: 'EN_CHECKLIST' | 'EN_CALIDAD' | 'APROBADO' | 'RECHAZADO'
}

export interface WeighingRecord {
  id: string
  turnId: string
  turnNumber: number
  vehiclePlate: string
  driverName: string
  clientName: string
  productName: string
  qualityName: string
  operationType: OperationType
  requestedTons: number
  initialWeight?: number
  finalWeight?: number
  netWeight?: number
  assignedBay?: number
  status: 'ESPERANDO_INICIAL' | 'INICIAL_REGISTRADO' | 'ESPERANDO_FINAL' | 'COMPLETADO'
  initialWeightTime?: Date
  finalWeightTime?: Date
}

export interface BayOperation {
  id: string
  bay: number
  turnId: string
  turnNumber: number
  vehiclePlate: string
  driverName: string
  clientName: string
  productName: string
  qualityName: string
  operationType: OperationType
  tons: number
  status: 'EN_PROCESO' | 'COMPLETADO' | 'ESPERANDO_SALIDA' | 'SALIDA_AUTORIZADA'
  startTime: Date
  endTime?: Date
  exitOrderNumber?: string
  exitOrderGenerated: boolean
  exitAuthorized: boolean
  exitTime?: Date
}

export interface ParticipationConfig {
  id: string
  clientId: string
  clientName: string
  productType: 'ACEITE' | 'GLP' | 'TODOS'
  percentage: number
  totalBays: number
  assignedBays: number
  slaHours: number
  active: boolean
}

export interface CyclePhaseStatus {
  key: VehiclePhase
  label: string
  icon: string
  status: 'completed' | 'active' | 'pending'
  time?: Date
  durationMinutes?: number
}

export interface VehicleCycleStatus {
  turnId: string
  turnNumber: number
  vehiclePlate: string
  driverName: string
  clientId: string
  clientName: string
  operationType: OperationType
  productName: string
  qualityName: string
  requestedTons: number
  currentPhase: VehiclePhase
  arrivalTime: Date
  estimatedCompletion?: Date
  phases: CyclePhaseStatus[]
}

export interface KpiPhaseTime {
  phase: string
  avgMinutes: number
  color: string
}

export interface BayOccupancy {
  bay: number
  status: 'libre' | 'ocupada' | 'mantenimiento'
  clientName?: string
  operationType?: OperationType
  startTime?: Date
  progress?: number
}
