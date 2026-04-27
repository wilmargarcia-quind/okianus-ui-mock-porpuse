import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Truck, Clock, CheckCircle2, Package, Hash,
  AlertTriangle, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOperational, type OperationalVehicle } from '@/contexts/OperationalContext'
import type { VehiclePhase } from '@/types'

// ─── cycle steps shown to client (simplified) ─────────────────────────────────

const CLIENT_STEPS: { phases: VehiclePhase[]; label: string; short: string }[] = [
  { phases: ['PRE_REGISTRO'],                       label: 'Registro',  short: 'Reg.' },
  { phases: ['TURNO_ASIGNADO', 'CONFIRMADO'],       label: 'Turno',     short: 'Turno' },
  { phases: ['EN_PATIO'],                           label: 'Patio',     short: 'Patio' },
  { phases: ['EN_PESAJE_INICIAL'],                  label: 'Pesaje',    short: 'Pesaje' },
  { phases: ['EN_BAHIA', 'EN_PESAJE_FINAL', 'ESPERANDO_SALIDA'], label: 'Bahía', short: 'Bahía' },
  { phases: ['COMPLETADO'],                         label: 'Completado', short: 'Listo' },
]

function getStepIndex(phase: VehiclePhase): number {
  return CLIENT_STEPS.findIndex(s => s.phases.includes(phase))
}

// ─── vehicle card ─────────────────────────────────────────────────────────────

function VehicleCard({ v }: { v: OperationalVehicle }) {
  const stepIdx      = getStepIndex(v.phase)
  const isCompleted  = v.phase === 'COMPLETADO'
  const isRejected   = v.phase === 'RECHAZADO'
  const progress     = isCompleted ? 100 : isRejected ? 0 : Math.round((stepIdx / (CLIENT_STEPS.length - 1)) * 100)

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden ${
      isRejected ? 'border-red-200' : 'border-[#E8EDF2]'
    }`}>
      {/* Card header */}
      <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b ${
        isRejected ? 'border-red-100 bg-red-50' : isCompleted ? 'border-emerald-100 bg-emerald-50' : 'border-[#E8EDF2] bg-[#F7F9FC]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
            isRejected ? 'bg-red-500' : isCompleted ? 'bg-emerald-600' : 'bg-[#1C2434]'
          }`}>
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-[#1C2434] font-mono tracking-wide">{v.vehiclePlate}</p>
            <p className="text-xs text-[#637381]">{v.driverName}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            isRejected  ? 'bg-red-50 text-red-700 border-red-200' :
            isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20'
          }`}>
            {isRejected ? '✗ Rechazado' : isCompleted ? '✓ Completado' : CLIENT_STEPS[stepIdx]?.label ?? v.phase}
          </span>
          <p className="text-xs text-[#9BAEC8] mt-1">Turno #{v.turnNumber}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Product & operation info */}
        <div className="flex flex-wrap gap-3 text-xs text-[#637381]">
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-[#9BAEC8]" />
            {v.productName} — {v.qualityName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#9BAEC8]" />
            Llegada: {format(v.arrivalTime, 'HH:mm', { locale: es })}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            v.operationType === 'CARGUE'
              ? 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {v.operationType}
          </span>
          <span className="text-[#9BAEC8]">{v.requestedTons} t</span>
        </div>

        {/* Rejection note */}
        {isRejected && v.qualityLabNotes && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{v.qualityLabNotes}</p>
          </div>
        )}

        {!isRejected && (
          <>
            {/* Step timeline */}
            <div className="relative">
              {/* Track line */}
              <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-[#E8EDF2]" />
              {/* Filled track */}
              <div
                className="absolute top-3.5 left-3.5 h-0.5 bg-emerald-500 transition-all"
                style={{ width: `${Math.min(progress, 100) * (100 - 0) / 100}%` }}
              />
              {/* Steps */}
              <div className="relative flex justify-between">
                {CLIENT_STEPS.map((step, i) => {
                  const done   = i < stepIdx
                  const active = i === stepIdx && !isCompleted
                  const finish = isCompleted
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-1.5 z-10">
                      <div className={[
                        'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        (done || finish) ? 'bg-emerald-500 text-white' : '',
                        active           ? 'bg-[#1E88E5] text-white ring-2 ring-[#1E88E5]/30 ring-offset-1' : '',
                        !done && !active && !finish ? 'bg-[#F0F4F8] text-[#9BAEC8]' : '',
                      ].join(' ')}>
                        {(done || finish) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                      </div>
                      <span className={[
                        'text-[10px] font-medium text-center leading-tight',
                        (done || finish) ? 'text-emerald-600' : '',
                        active           ? 'text-[#1E88E5]'   : '',
                        !done && !active && !finish ? 'text-[#9BAEC8]' : '',
                      ].join(' ')}>
                        {step.short}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9BAEC8]">Progreso del ciclo</span>
                <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-[#1C2434]'}`}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E8EDF2] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-[#1E88E5]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Weights (if available) */}
            {v.netWeight != null && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  Operación completada · {v.netWeight.toFixed(1)} t netas
                </p>
              </div>
            )}

            {/* Bay assigned */}
            {v.assignedBay && v.phase !== 'COMPLETADO' && (
              <div className="flex items-center gap-2 text-xs text-[#637381]">
                <Hash className="h-3.5 w-3.5 text-[#9BAEC8]" />
                Bahía asignada: <span className="font-semibold text-[#1C2434]">Bahía {v.assignedBay}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ClientVehiclesPage() {
  const { user }     = useAuth()
  const { vehicles } = useOperational()
  const clientId     = user?.clientId || 'CLI-001'

  const myVehicles = useMemo(() =>
    vehicles.filter(v => v.clientId === clientId),
  [vehicles, clientId])

  const active    = myVehicles.filter(v => !['COMPLETADO', 'RECHAZADO'].includes(v.phase))
  const completed = myVehicles.filter(v => v.phase === 'COMPLETADO')
  const rejected  = myVehicles.filter(v => v.phase === 'RECHAZADO')

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">Mis Vehículos</h1>
        <p className="mt-0.5 text-sm text-[#637381]">
          Seguimiento en tiempo real del ciclo operacional de sus vehículos en planta
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En proceso',      value: active.length,    color: 'text-[#1E88E5]',   bg: 'bg-[#1E88E5]/10',   icon: Clock },
          { label: 'Completados hoy', value: completed.length, color: 'text-emerald-600', bg: 'bg-emerald-50',    icon: CheckCircle2 },
          { label: 'Rechazados',      value: rejected.length,  color: rejected.length > 0 ? 'text-red-600' : 'text-[#9BAEC8]', bg: rejected.length > 0 ? 'bg-red-50' : 'bg-[#F7F9FC]', icon: AlertTriangle },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm px-5 py-4 flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${k.bg}`}>
              <k.icon className={`h-4.5 w-4.5 ${k.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-[#9BAEC8]">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active vehicles */}
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">En proceso</p>
          {active.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Completados hoy</p>
          {completed.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Rechazados</p>
          {rejected.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}

      {/* Empty state */}
      {myVehicles.length === 0 && (
        <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm py-16 text-center">
          <Truck className="h-10 w-10 text-[#E8EDF2] mx-auto mb-3" />
          <p className="text-sm text-[#9BAEC8]">No hay vehículos registrados hoy</p>
        </div>
      )}
    </div>
  )
}
