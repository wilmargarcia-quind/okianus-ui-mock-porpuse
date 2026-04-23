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
  notes?: string
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
