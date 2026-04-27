import { createContext, useContext, useState, useCallback } from 'react'
import type { VehiclePhase, ChecklistItem } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OperationalVehicle {
  id: string
  phase: VehiclePhase
  registeredAt: Date
  phaseHistory: { phase: VehiclePhase; at: Date }[]

  // Driver & Vehicle
  driverName: string
  driverCedula: string
  licenseType: string
  phone: string
  vehiclePlate: string
  vehicleType: string
  vehicleCapacity: number
  runtValidated: boolean

  // Client & Product
  clientId: string
  clientName: string
  productName: string
  qualityName: string
  operationType: 'CARGUE' | 'DESCARGUE'
  requestedTons: number
  clientParticipation: number

  // Turn
  turnNumber: number
  arrivalTime: Date
  waitingMinutes: number
  assignedBay?: number

  // Documents
  documents: { type: string; status: 'pendiente' | 'cargado' | 'validado' }[]

  // Patio / Checklist
  checklist: ChecklistItem[]
  qualityStatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  qualityLabNotes: string
  entryTime?: Date

  // Weighing
  initialWeight?: number
  finalWeight?: number
  netWeight?: number
  initialWeightTime?: Date
  finalWeightTime?: Date

  // Bay
  bayStartTime?: Date
  bayProgress: number
  tons: number
  exitOrderGenerated: boolean
  exitAuthorized: boolean
  exitOrderNumber?: string
}

interface OperationalContextType {
  vehicles: OperationalVehicle[]
  addVehicle: (v: Omit<OperationalVehicle, 'id' | 'phase' | 'registeredAt' | 'phaseHistory'>) => string
  updateVehicle: (id: string, updates: Partial<OperationalVehicle>) => void
  advancePhase: (id: string, nextPhase: VehiclePhase, extraData?: Partial<OperationalVehicle>) => void
}

const OperationalContext = createContext<OperationalContextType | null>(null)

export function useOperational() {
  const ctx = useContext(OperationalContext)
  if (!ctx) throw new Error('useOperational must be used inside OperationalProvider')
  return ctx
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000)
}

const STD_DOCS = [
  { type: 'Cédula / RUNT',      status: 'validado'  as const },
  { type: 'Licencia',           status: 'validado'  as const },
  { type: 'Manifiesto de carga', status: 'validado' as const },
  { type: 'Seguro transporte',  status: 'cargado'   as const },
]

function makeChecklist(doneCount: number): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: 'c1',  label: 'Cédula del conductor coincide con RUNT',   category: 'CONDUCTOR',  checked: false, required: true  },
    { id: 'c2',  label: 'Licencia de conducción vigente y correcta', category: 'CONDUCTOR', checked: false, required: true  },
    { id: 'c3',  label: 'Placa del vehículo coincide con solicitud', category: 'VEHICULO',  checked: false, required: true  },
    { id: 'c4',  label: 'Estado general del vehículo aceptable',     category: 'VEHICULO',  checked: false, required: true  },
    { id: 'c5',  label: 'Cisterna limpia y sin contaminantes',       category: 'VEHICULO',  checked: false, required: true  },
    { id: 'c6',  label: 'Sellos de seguridad en buen estado',        category: 'VEHICULO',  checked: false, required: false },
    { id: 'c7',  label: 'Manifiesto de carga presentado',            category: 'DOCUMENTOS',checked: false, required: true  },
    { id: 'c8',  label: 'Orden de cargue/descargue válida',          category: 'DOCUMENTOS',checked: false, required: true  },
    { id: 'c9',  label: 'Seguro de transporte vigente',              category: 'DOCUMENTOS',checked: false, required: false },
    { id: 'c10', label: 'EPP completo (casco, botas, chaleco)',       category: 'SEGURIDAD', checked: false, required: true  },
    { id: 'c11', label: 'Extintor en buen estado',                   category: 'SEGURIDAD', checked: false, required: true  },
    { id: 'c12', label: 'Kit de derrame disponible',                  category: 'SEGURIDAD', checked: false, required: false },
  ]
  return items.map((item, i) => ({ ...item, checked: i < doneCount }))
}

// ─── Initial demo vehicles ────────────────────────────────────────────────────
// Each vehicle is at a different stage of the cycle to tell a full story.

const INITIAL_VEHICLES: OperationalVehicle[] = [
  // 1. Just arrived — operator needs to assign turn
  {
    id: 'ov-1',
    phase: 'PRE_REGISTRO',
    registeredAt: ago(8),
    phaseHistory: [{ phase: 'PRE_REGISTRO', at: ago(8) }],
    turnNumber: 9,
    driverName: 'Pedro González',       driverCedula: '12345678',
    licenseType: 'C3', phone: '310 555 0101',
    vehiclePlate: 'TRC-891', vehicleType: 'Camión Cisterna', vehicleCapacity: 30,
    runtValidated: true,
    clientId: 'CLI-001', clientName: 'BioEnergía S.A.',
    productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', requestedTons: 28, clientParticipation: 35,
    arrivalTime: ago(8), waitingMinutes: 8,
    documents: STD_DOCS, checklist: makeChecklist(0),
    qualityStatus: 'PENDIENTE', qualityLabNotes: '',
    bayProgress: 0, tons: 0,
    exitOrderGenerated: false, exitAuthorized: false,
  },

  // 2. Turn assigned — WAITING 97 MIN → RED ALERT
  {
    id: 'ov-2',
    phase: 'TURNO_ASIGNADO',
    registeredAt: ago(97),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',   at: ago(102) },
      { phase: 'TURNO_ASIGNADO', at: ago(97)  },
    ],
    turnNumber: 2,
    driverName: 'Luis Hernández',       driverCedula: '87654321',
    licenseType: 'CE', phone: '320 555 0202',
    vehiclePlate: 'TRC-042', vehicleType: 'Tractomula Cisterna', vehicleCapacity: 45,
    runtValidated: true,
    clientId: 'CLI-004', clientName: 'Combustibles del Caribe',
    productName: 'GLP', qualityName: 'Mezcla Comercial',
    operationType: 'CARGUE', requestedTons: 42, clientParticipation: 20,
    arrivalTime: ago(102), waitingMinutes: 97,
    documents: STD_DOCS, checklist: makeChecklist(0),
    qualityStatus: 'PENDIENTE', qualityLabNotes: '',
    bayProgress: 0, tons: 0,
    exitOrderGenerated: false, exitAuthorized: false,
  },

  // 3. In patio — checklist 8/12 (in progress by operator)
  {
    id: 'ov-3',
    phase: 'EN_PATIO',
    registeredAt: ago(55),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',   at: ago(60) },
      { phase: 'TURNO_ASIGNADO', at: ago(55) },
      { phase: 'CONFIRMADO',     at: ago(48) },
      { phase: 'EN_PATIO',       at: ago(22) },
    ],
    turnNumber: 3,
    driverName: 'María Rodríguez',      driverCedula: '11223344',
    licenseType: 'C3', phone: '300 555 0303',
    vehiclePlate: 'TRC-156', vehicleType: 'Camión Cisterna', vehicleCapacity: 28,
    runtValidated: true,
    clientId: 'CLI-006', clientName: 'Aceites del Pacífico',
    productName: 'Aceite de Palma', qualityName: 'Estándar',
    operationType: 'CARGUE', requestedTons: 25, clientParticipation: 25,
    arrivalTime: ago(60), waitingMinutes: 22,
    documents: STD_DOCS,
    checklist: makeChecklist(8),
    qualityStatus: 'PENDIENTE', qualityLabNotes: '',
    entryTime: ago(22), assignedBay: 3,
    bayProgress: 0, tons: 0,
    exitOrderGenerated: false, exitAuthorized: false,
  },

  // 4. Initial weighing — waiting for operator to register weight
  {
    id: 'ov-4',
    phase: 'EN_PESAJE_INICIAL',
    registeredAt: ago(80),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',      at: ago(85) },
      { phase: 'TURNO_ASIGNADO',    at: ago(80) },
      { phase: 'CONFIRMADO',        at: ago(72) },
      { phase: 'EN_PATIO',          at: ago(55) },
      { phase: 'EN_PESAJE_INICIAL', at: ago(18) },
    ],
    turnNumber: 4,
    driverName: 'Carlos Mendoza',       driverCedula: '55667788',
    licenseType: 'C2', phone: '315 555 0404',
    vehiclePlate: 'TRC-307', vehicleType: 'Tractomula Cisterna', vehicleCapacity: 50,
    runtValidated: true,
    clientId: 'CLI-001', clientName: 'BioEnergía S.A.',
    productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'DESCARGUE', requestedTons: 38, clientParticipation: 35,
    arrivalTime: ago(85), waitingMinutes: 18,
    documents: STD_DOCS,
    checklist: makeChecklist(12),
    qualityStatus: 'APROBADO', qualityLabNotes: 'Muestra conforme. Acidez 0.08%.',
    entryTime: ago(55), assignedBay: 1,
    bayProgress: 0, tons: 0,
    exitOrderGenerated: false, exitAuthorized: false,
  },

  // 5. Active in bay — loading at 65%, 52 min elapsed
  {
    id: 'ov-5',
    phase: 'EN_BAHIA',
    registeredAt: ago(130),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',      at: ago(135) },
      { phase: 'TURNO_ASIGNADO',    at: ago(130) },
      { phase: 'CONFIRMADO',        at: ago(118) },
      { phase: 'EN_PATIO',          at: ago(105) },
      { phase: 'EN_PESAJE_INICIAL', at: ago(90)  },
      { phase: 'EN_BAHIA',          at: ago(52)  },
    ],
    turnNumber: 5,
    driverName: 'Ana Castro',           driverCedula: '12345678',
    licenseType: 'C3', phone: '310 555 0505',
    vehiclePlate: 'TRC-518', vehicleType: 'Camión Cisterna', vehicleCapacity: 30,
    runtValidated: true,
    clientId: 'CLI-004', clientName: 'Combustibles del Caribe',
    productName: 'GLP', qualityName: 'Propano',
    operationType: 'CARGUE', requestedTons: 28, clientParticipation: 20,
    arrivalTime: ago(135), waitingMinutes: 0,
    documents: STD_DOCS,
    checklist: makeChecklist(12),
    qualityStatus: 'APROBADO', qualityLabNotes: 'Conforme.',
    entryTime: ago(105), assignedBay: 2,
    initialWeight: 18.2, initialWeightTime: ago(88),
    bayStartTime: ago(52), bayProgress: 65,
    tons: 28, exitOrderGenerated: false, exitAuthorized: false,
  },

  // 6. Final weighing — operation done, needs final weight
  {
    id: 'ov-6',
    phase: 'EN_PESAJE_FINAL',
    registeredAt: ago(185),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',      at: ago(190) },
      { phase: 'TURNO_ASIGNADO',    at: ago(185) },
      { phase: 'CONFIRMADO',        at: ago(175) },
      { phase: 'EN_PATIO',          at: ago(160) },
      { phase: 'EN_PESAJE_INICIAL', at: ago(145) },
      { phase: 'EN_BAHIA',          at: ago(105) },
      { phase: 'EN_PESAJE_FINAL',   at: ago(14)  },
    ],
    turnNumber: 6,
    driverName: 'Jorge Silva',          driverCedula: '87654321',
    licenseType: 'CE', phone: '320 555 0606',
    vehiclePlate: 'TRC-629', vehicleType: 'Tractomula Cisterna', vehicleCapacity: 45,
    runtValidated: true,
    clientId: 'CLI-003', clientName: 'Palmas del Norte',
    productName: 'Aceite de Palma', qualityName: 'Industrial',
    operationType: 'DESCARGUE', requestedTons: 40, clientParticipation: 15,
    arrivalTime: ago(190), waitingMinutes: 0,
    documents: STD_DOCS,
    checklist: makeChecklist(12),
    qualityStatus: 'APROBADO', qualityLabNotes: 'Muestra Industrial aprobada.',
    entryTime: ago(160), assignedBay: 4,
    initialWeight: 62.1, initialWeightTime: ago(143),
    bayStartTime: ago(105), bayProgress: 100,
    tons: 40, exitOrderGenerated: false, exitAuthorized: false,
  },

  // 7. Waiting exit authorization — operation complete, exit order generated
  {
    id: 'ov-7',
    phase: 'ESPERANDO_SALIDA',
    registeredAt: ago(240),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',      at: ago(245) },
      { phase: 'TURNO_ASIGNADO',    at: ago(240) },
      { phase: 'CONFIRMADO',        at: ago(230) },
      { phase: 'EN_PATIO',          at: ago(215) },
      { phase: 'EN_PESAJE_INICIAL', at: ago(200) },
      { phase: 'EN_BAHIA',          at: ago(155) },
      { phase: 'EN_PESAJE_FINAL',   at: ago(65)  },
      { phase: 'ESPERANDO_SALIDA',  at: ago(32)  },
    ],
    turnNumber: 7,
    driverName: 'Roberto López',        driverCedula: '11223344',
    licenseType: 'C3', phone: '300 555 0707',
    vehiclePlate: 'TRC-734', vehicleType: 'Camión Cisterna', vehicleCapacity: 30,
    runtValidated: true,
    clientId: 'CLI-006', clientName: 'Aceites del Pacífico',
    productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', requestedTons: 26, clientParticipation: 25,
    arrivalTime: ago(245), waitingMinutes: 0,
    documents: STD_DOCS,
    checklist: makeChecklist(12),
    qualityStatus: 'APROBADO', qualityLabNotes: '',
    entryTime: ago(215), assignedBay: 3,
    initialWeight: 22.4, initialWeightTime: ago(198),
    finalWeight: 48.8, finalWeightTime: ago(63), netWeight: 26.4,
    bayStartTime: ago(155), bayProgress: 100,
    tons: 26, exitOrderGenerated: true, exitAuthorized: false,
    exitOrderNumber: 'SAL-2026-007',
  },

  // 8. Completed
  {
    id: 'ov-8',
    phase: 'COMPLETADO',
    registeredAt: ago(360),
    phaseHistory: [
      { phase: 'PRE_REGISTRO',      at: ago(365) },
      { phase: 'TURNO_ASIGNADO',    at: ago(360) },
      { phase: 'CONFIRMADO',        at: ago(350) },
      { phase: 'EN_PATIO',          at: ago(335) },
      { phase: 'EN_PESAJE_INICIAL', at: ago(320) },
      { phase: 'EN_BAHIA',          at: ago(280) },
      { phase: 'EN_PESAJE_FINAL',   at: ago(195) },
      { phase: 'ESPERANDO_SALIDA',  at: ago(190) },
      { phase: 'COMPLETADO',        at: ago(175) },
    ],
    turnNumber: 1,
    driverName: 'Carmen Díaz',          driverCedula: '55667788',
    licenseType: 'C2', phone: '315 555 0808',
    vehiclePlate: 'TRC-215', vehicleType: 'Camión Cisterna', vehicleCapacity: 28,
    runtValidated: true,
    clientId: 'CLI-001', clientName: 'BioEnergía S.A.',
    productName: 'Aceite de Palma', qualityName: 'Alta Pureza',
    operationType: 'CARGUE', requestedTons: 24, clientParticipation: 35,
    arrivalTime: ago(365), waitingMinutes: 0,
    documents: STD_DOCS.map(d => ({ ...d, status: 'validado' as const })),
    checklist: makeChecklist(12),
    qualityStatus: 'APROBADO', qualityLabNotes: '',
    entryTime: ago(335), assignedBay: 2,
    initialWeight: 19.5, initialWeightTime: ago(318),
    finalWeight: 43.8, finalWeightTime: ago(193), netWeight: 24.3,
    bayStartTime: ago(280), bayProgress: 100,
    tons: 24.3, exitOrderGenerated: true, exitAuthorized: true,
    exitOrderNumber: 'SAL-2026-001',
  },

  // 9. Rejected — failed RUNT
  {
    id: 'ov-9',
    phase: 'RECHAZADO',
    registeredAt: ago(45),
    phaseHistory: [
      { phase: 'PRE_REGISTRO', at: ago(48) },
      { phase: 'RECHAZADO',    at: ago(45) },
    ],
    turnNumber: 10,
    driverName: 'Juan Morales',         driverCedula: '99887766',
    licenseType: 'C1', phone: '305 555 0909',
    vehiclePlate: 'VEJ-882', vehicleType: 'Camión Cisterna', vehicleCapacity: 20,
    runtValidated: false,
    clientId: 'CLI-002', clientName: 'PetroAndina Ltda.',
    productName: 'GLP', qualityName: 'Mezcla Comercial',
    operationType: 'CARGUE', requestedTons: 18, clientParticipation: 10,
    arrivalTime: ago(48), waitingMinutes: 0,
    documents: [
      { type: 'Cédula / RUNT',       status: 'pendiente' },
      { type: 'Licencia',            status: 'pendiente' },
      { type: 'Manifiesto de carga', status: 'pendiente' },
      { type: 'Seguro transporte',   status: 'pendiente' },
    ],
    checklist: makeChecklist(0),
    qualityStatus: 'PENDIENTE', qualityLabNotes: 'Licencia de conducción vencida desde 2025-11.',
    bayProgress: 0, tons: 0,
    exitOrderGenerated: false, exitAuthorized: false,
  },
]

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OperationalProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<OperationalVehicle[]>(INITIAL_VEHICLES)

  const addVehicle = useCallback((v: Omit<OperationalVehicle, 'id' | 'phase' | 'registeredAt' | 'phaseHistory'>): string => {
    const id = `ov-${Date.now()}`
    const now = new Date()
    setVehicles(prev => [
      {
        ...v,
        id,
        phase: 'PRE_REGISTRO',
        registeredAt: now,
        phaseHistory: [{ phase: 'PRE_REGISTRO', at: now }],
      },
      ...prev,
    ])
    return id
  }, [])

  const updateVehicle = useCallback((id: string, updates: Partial<OperationalVehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))
  }, [])

  const advancePhase = useCallback((id: string, nextPhase: VehiclePhase, extraData?: Partial<OperationalVehicle>) => {
    const now = new Date()
    setVehicles(prev => prev.map(v => {
      if (v.id !== id) return v
      return {
        ...v,
        ...(extraData ?? {}),
        phase: nextPhase,
        phaseHistory: [...v.phaseHistory, { phase: nextPhase, at: now }],
        waitingMinutes: 0,
      }
    }))
  }, [])

  return (
    <OperationalContext.Provider value={{ vehicles, addVehicle, updateVehicle, advancePhase }}>
      {children}
    </OperationalContext.Provider>
  )
}
