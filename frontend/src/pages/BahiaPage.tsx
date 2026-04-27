import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Anchor, CheckCircle2, Clock, FileText, LogOut,
  Wrench, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useOperational, type OperationalVehicle } from '@/contexts/OperationalContext'

// ─── local types ──────────────────────────────────────────────────────────────

interface BayInfo {
  bay: number
  status: 'ocupada' | 'libre' | 'mantenimiento'
  clientName?: string
  operationType?: 'CARGUE' | 'DESCARGUE'
  startTime?: Date
  progress?: number
  vehicleId?: string
}

// Bay 5 is reserved for maintenance in demo
const MAINTENANCE_BAYS = new Set([5])
const TOTAL_BAYS = 6

// ─── op status ────────────────────────────────────────────────────────────────

type OpStatus = 'EN_PROCESO' | 'COMPLETADO' | 'ESPERANDO_SALIDA' | 'SALIDA_AUTORIZADA'

function getOpStatus(v: OperationalVehicle): OpStatus {
  if (v.exitAuthorized)       return 'SALIDA_AUTORIZADA'
  if (v.exitOrderGenerated)   return 'ESPERANDO_SALIDA'
  if (v.phase === 'EN_BAHIA') return 'EN_PROCESO'
  return 'COMPLETADO'
}

const OP_STATUS_META: Record<OpStatus, { label: string; cls: string; dot: string }> = {
  EN_PROCESO:        { label: 'En proceso',       cls: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  COMPLETADO:        { label: 'Completado',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ESPERANDO_SALIDA:  { label: 'Esp. salida',       cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  SALIDA_AUTORIZADA: { label: 'Salida autorizada', cls: 'bg-teal-50 text-teal-700 border-teal-200',     dot: 'bg-teal-500' },
}

function OpStatusPill({ status }: { status: OpStatus }) {
  const m = OP_STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#E8EDF2] last:border-0">
      <span className="text-xs text-[#9BAEC8] whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-[#1C2434] text-right">{value}</span>
    </div>
  )
}

function elapsedMin(start: Date) {
  return Math.round((Date.now() - start.getTime()) / 60_000)
}

// ─── Bay Grid Card ─────────────────────────────────────────────────────────────

function BayCard({ bay, onSelect }: { bay: BayInfo; onSelect?: () => void }) {
  const isOccupied    = bay.status === 'ocupada'
  const isMaintenance = bay.status === 'mantenimiento'
  const isFree        = !isOccupied && !isMaintenance
  const elapsed       = bay.startTime ? elapsedMin(bay.startTime) : 0

  return (
    <div
      className={[
        'rounded-xl border-2 p-4 transition-all',
        isOccupied    ? 'border-[#1E88E5] bg-white cursor-pointer hover:shadow-md hover:border-[#1976D2]' : '',
        isMaintenance ? 'border-amber-300 bg-amber-50' : '',
        isFree        ? 'border-[#E8EDF2] bg-[#F7F9FC]' : '',
      ].join(' ')}
      onClick={isOccupied ? onSelect : undefined}
    >
      {/* Bay number row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${
            isOccupied ? 'bg-[#1E88E5]' : isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            {bay.bay}
          </div>
          <span className="text-sm font-semibold text-[#1C2434]">Bahía {bay.bay}</span>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
          isOccupied    ? 'bg-blue-50 text-blue-700 border-blue-200' :
          isMaintenance ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isOccupied ? 'bg-blue-500' : isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {isOccupied ? 'Ocupada' : isMaintenance ? 'Mantenimiento' : 'Libre'}
        </span>
      </div>

      {/* Content */}
      {isOccupied && bay.clientName && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#1C2434] truncate">{bay.clientName}</p>
          <p className="text-xs text-[#637381]">{bay.operationType}</p>
          {bay.startTime && (
            <div className="flex items-center justify-between text-xs text-[#9BAEC8]">
              <span>Inicio: {format(bay.startTime, 'HH:mm', { locale: es })}</span>
              <span className={elapsed > 120 ? 'text-amber-600 font-medium' : ''}>{elapsed} min</span>
            </div>
          )}
          {bay.progress != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9BAEC8]">Progreso</span>
                <span className="font-medium text-[#637381]">{bay.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E8EDF2] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${bay.progress >= 100 ? 'bg-emerald-500' : 'bg-[#1E88E5]'}`}
                  style={{ width: `${bay.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {isMaintenance && (
        <div className="flex items-center gap-2 text-xs text-amber-700">
          <Wrench className="h-3.5 w-3.5" /> En mantenimiento
        </div>
      )}

      {isFree && (
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Disponible
        </div>
      )}
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function BahiaPage() {
  const { vehicles, advancePhase, updateVehicle } = useOperational()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedVehicle = vehicles.find(v => v.id === selectedId) ?? null

  // Bay operations: vehicles currently in or recently completed bay
  const bayVehicles = useMemo(() =>
    vehicles.filter(v => ['EN_BAHIA', 'ESPERANDO_SALIDA', 'COMPLETADO'].includes(v.phase)),
  [vehicles])

  // Derive bay grid from active vehicles
  const bayGrid = useMemo((): BayInfo[] =>
    Array.from({ length: TOTAL_BAYS }, (_, i) => {
      const bayNum = i + 1
      const vehicle = vehicles.find(v =>
        v.assignedBay === bayNum &&
        ['EN_BAHIA', 'ESPERANDO_SALIDA'].includes(v.phase)
      )
      if (vehicle) {
        return {
          bay: bayNum,
          status: 'ocupada',
          clientName: vehicle.clientName,
          operationType: vehicle.operationType,
          startTime: vehicle.bayStartTime,
          progress: vehicle.bayProgress,
          vehicleId: vehicle.id,
        }
      }
      if (MAINTENANCE_BAYS.has(bayNum)) {
        return { bay: bayNum, status: 'mantenimiento' }
      }
      return { bay: bayNum, status: 'libre' }
    }),
  [vehicles])

  const kpis = useMemo(() => ({
    total:       TOTAL_BAYS,
    occupied:    bayGrid.filter(b => b.status === 'ocupada').length,
    free:        bayGrid.filter(b => b.status === 'libre').length,
    maintenance: bayGrid.filter(b => b.status === 'mantenimiento').length,
  }), [bayGrid])

  function handleComplete(v: OperationalVehicle) {
    advancePhase(v.id, 'EN_PESAJE_FINAL', { bayProgress: 100 })
    toast.success(`Operación en Bahía ${v.assignedBay} completada`, {
      description: `${v.vehiclePlate} — ${v.clientName} · ${v.tons.toFixed(1)} t`,
    })
    setSelectedId(null)
  }

  function handleGenerateExit(v: OperationalVehicle) {
    const num = `SAL-2026-${String(v.turnNumber).padStart(3, '0')}`
    updateVehicle(v.id, { exitOrderGenerated: true, exitOrderNumber: num })
    toast.success('Orden de salida generada', {
      description: `Orden ${num} para ${v.vehiclePlate}`,
    })
  }

  function handleAuthorizeExit(v: OperationalVehicle) {
    advancePhase(v.id, 'COMPLETADO', { exitAuthorized: true })
    toast.success('Salida autorizada', {
      description: `${v.vehiclePlate} puede retirarse de las instalaciones`,
    })
    setSelectedId(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">Operaciones de Bahía</h1>
        <p className="mt-0.5 text-sm text-[#637381]">
          Estado de las bahías, control de cargue/descargue y autorización de salida
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total bahías"  value={kpis.total}
          icon={Anchor}       iconColor="text-[#1E88E5]" iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Ocupadas"      value={kpis.occupied}
          icon={Clock}        iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="Libres"        value={kpis.free}
          icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Mantenimiento" value={kpis.maintenance}
          icon={Wrench}       iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Bay Grid */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Vista de bahías</p>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {bayGrid.map(bay => {
            const vehicle = bay.vehicleId ? vehicles.find(v => v.id === bay.vehicleId) : undefined
            return (
              <BayCard
                key={bay.bay}
                bay={bay}
                onSelect={vehicle ? () => setSelectedId(vehicle.id) : undefined}
              />
            )
          })}
        </div>
      </div>

      {/* Active operations table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8EDF2] px-5 py-3.5 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1C2434]">Operaciones activas</p>
          <p className="text-xs text-[#9BAEC8]">{bayVehicles.length} operaciones</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Bahía', 'Conductor / Placa', 'Cliente / Producto', 'Tipo', 'Inicio', 'Toneladas', 'Estado', ''].map((h, idx) => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${idx === 5 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bayVehicles.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-[#F0F4F8] cursor-pointer transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}
                  onClick={() => setSelectedId(v.id)}
                >
                  {/* Bahía */}
                  <td className="px-5 py-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E88E5] text-white font-bold text-sm">
                      {v.assignedBay ?? '—'}
                    </div>
                  </td>
                  {/* Conductor */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#1C2434]">{v.driverName}</p>
                    <p className="text-xs text-[#9BAEC8] font-mono">{v.vehiclePlate}</p>
                  </td>
                  {/* Cliente */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-[#1C2434]">{v.clientName}</p>
                    <p className="text-xs text-[#9BAEC8]">{v.productName} · {v.qualityName}</p>
                  </td>
                  {/* Tipo */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      v.operationType === 'CARGUE'
                        ? 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {v.operationType}
                    </span>
                  </td>
                  {/* Inicio */}
                  <td className="px-5 py-3.5">
                    {v.bayStartTime ? (
                      <>
                        <p className="text-sm text-[#637381]">{format(v.bayStartTime, 'HH:mm', { locale: es })}</p>
                        <p className="text-xs text-[#9BAEC8]">{elapsedMin(v.bayStartTime)} min</p>
                      </>
                    ) : (
                      <span className="text-sm text-[#9BAEC8]">—</span>
                    )}
                  </td>
                  {/* Toneladas */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-semibold tabular-nums text-[#1C2434]">
                      {v.tons > 0 ? `${v.tons.toFixed(1)} t` : '—'}
                    </span>
                  </td>
                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <OpStatusPill status={getOpStatus(v)} />
                  </td>
                  {/* Arrow */}
                  <td className="px-5 py-3.5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] transition-colors hover:bg-[#F0F4F8] hover:text-[#1C2434]">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {bayVehicles.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay operaciones activas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedVehicle} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">
          {selectedVehicle && (
            <>
              {/* Header */}
              <div className="bg-white border-b border-[#E8EDF2] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E88E5] text-white font-bold text-xl">
                    {selectedVehicle.assignedBay ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#9BAEC8] font-medium">
                      Bahía {selectedVehicle.assignedBay} · Turno #{selectedVehicle.turnNumber}
                    </p>
                    <p className="font-bold text-[#1C2434] text-lg">{selectedVehicle.vehiclePlate}</p>
                    <p className="text-sm text-[#637381]">{selectedVehicle.clientName}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <OpStatusPill status={getOpStatus(selectedVehicle)} />
                  {selectedVehicle.bayProgress > 0 && (
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#E8EDF2] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${selectedVehicle.bayProgress >= 100 ? 'bg-emerald-500' : 'bg-[#1E88E5]'}`}
                          style={{ width: `${selectedVehicle.bayProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#637381]">{selectedVehicle.bayProgress}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Operation info */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Operación</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                    <InfoRow label="Conductor"  value={selectedVehicle.driverName} />
                    <InfoRow label="Placa"      value={<span className="font-mono">{selectedVehicle.vehiclePlate}</span>} />
                    <InfoRow label="Producto"   value={selectedVehicle.productName} />
                    <InfoRow label="Calidad"    value={selectedVehicle.qualityName} />
                    <InfoRow label="Tipo"       value={selectedVehicle.operationType} />
                    <InfoRow label="Toneladas"  value={selectedVehicle.tons > 0 ? `${selectedVehicle.tons.toFixed(1)} t` : `${selectedVehicle.requestedTons} t (est.)`} />
                    {selectedVehicle.bayStartTime && (
                      <InfoRow label="Inicio" value={format(selectedVehicle.bayStartTime, 'HH:mm', { locale: es })} />
                    )}
                    {selectedVehicle.finalWeightTime && (
                      <InfoRow label="Fin" value={format(selectedVehicle.finalWeightTime, 'HH:mm', { locale: es })} />
                    )}
                    {selectedVehicle.exitOrderNumber && (
                      <InfoRow label="Orden salida" value={selectedVehicle.exitOrderNumber} />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedVehicle.phase === 'EN_BAHIA' && (
                    <button
                      onClick={() => handleComplete(selectedVehicle)}
                      className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar operación completada
                    </button>
                  )}
                  {selectedVehicle.phase === 'ESPERANDO_SALIDA' && !selectedVehicle.exitOrderGenerated && (
                    <button
                      onClick={() => handleGenerateExit(selectedVehicle)}
                      className="w-full rounded-xl bg-[#1E88E5] py-3 text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Generar orden de salida
                    </button>
                  )}
                  {selectedVehicle.phase === 'ESPERANDO_SALIDA' && selectedVehicle.exitOrderGenerated && !selectedVehicle.exitAuthorized && (
                    <button
                      onClick={() => handleAuthorizeExit(selectedVehicle)}
                      className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Autorizar salida del vehículo
                    </button>
                  )}
                  {selectedVehicle.exitAuthorized && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Salida autorizada — vehículo puede retirarse
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
