import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Hash, Clock, CheckCircle2, Truck, Filter,
  Search, X, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useOperational } from '@/contexts/OperationalContext'
import type { VehiclePhase } from '@/types'

// ─── phase config ─────────────────────────────────────────────────────────────

const PHASE_STEPS: VehiclePhase[] = [
  'PRE_REGISTRO', 'TURNO_ASIGNADO', 'CONFIRMADO',
  'EN_PATIO', 'EN_PESAJE_INICIAL', 'EN_BAHIA', 'COMPLETADO',
]

const PHASE_META: Record<VehiclePhase, { label: string; short: string; color: string }> = {
  PRE_REGISTRO:      { label: 'Pre-registro',   short: 'Pre-reg',  color: 'bg-gray-100 text-gray-600 border-gray-200' },
  TURNO_ASIGNADO:    { label: 'Turno asignado', short: 'Turno',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMADO:        { label: 'Confirmado',     short: 'Conf.',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_PATIO:          { label: 'En patio',       short: 'Patio',    color: 'bg-violet-50 text-violet-700 border-violet-200' },
  EN_PESAJE_INICIAL: { label: 'Pesaje inicial', short: 'Pesaje',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  EN_BAHIA:          { label: 'En bahía',       short: 'Bahía',    color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  EN_PESAJE_FINAL:   { label: 'Pesaje final',   short: 'P.Final',  color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ESPERANDO_SALIDA:  { label: 'Esp. salida',    short: 'Salida',   color: 'bg-teal-50 text-teal-700 border-teal-200' },
  COMPLETADO:        { label: 'Completado',     short: 'Listo',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RECHAZADO:         { label: 'Rechazado',      short: 'Rechaz.',  color: 'bg-red-50 text-red-700 border-red-200' },
}

// ─── inner components ─────────────────────────────────────────────────────────

function PhasePill({ phase }: { phase: VehiclePhase }) {
  const m = PHASE_META[phase]
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${m.color}`}>
      {m.label}
    </span>
  )
}

function CycleBar({ phase }: { phase: VehiclePhase }) {
  const currentIdx = PHASE_STEPS.indexOf(
    phase === 'EN_PESAJE_FINAL' || phase === 'ESPERANDO_SALIDA' ? 'COMPLETADO'
    : phase === 'RECHAZADO' ? 'PRE_REGISTRO'
    : phase
  )
  return (
    <div className="flex items-center gap-0.5">
      {PHASE_STEPS.map((step, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        const reject = phase === 'RECHAZADO'
        return (
          <div
            key={step}
            title={PHASE_META[step].short}
            className={[
              'h-1.5 rounded-full transition-all',
              i < 3 ? 'w-6' : 'w-5',
              done                   ? 'bg-emerald-500' : '',
              active && !reject      ? 'bg-[#1E88E5]'   : '',
              active && reject       ? 'bg-red-500'      : '',
              !done && !active       ? 'bg-[#E8EDF2]'   : '',
            ].join(' ')}
          />
        )
      })}
    </div>
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

// ─── component ────────────────────────────────────────────────────────────────

export default function TurnosPage() {
  const { vehicles, advancePhase } = useOperational()
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState<string>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedVehicle = vehicles.find(v => v.id === selectedId) ?? null

  const kpis = useMemo(() => ({
    vehiclesInPlant: vehicles.filter(v => !['PRE_REGISTRO', 'COMPLETADO', 'RECHAZADO'].includes(v.phase)).length,
    turnsWaiting:    vehicles.filter(v => v.phase === 'TURNO_ASIGNADO').length,
    baysActive:      vehicles.filter(v => v.phase === 'EN_BAHIA').length,
    completedToday:  vehicles.filter(v => v.phase === 'COMPLETADO').length,
  }), [vehicles])

  const turns = useMemo(() => {
    const q = search.toLowerCase()
    return vehicles.filter(v => {
      const matchText =
        v.driverName.toLowerCase().includes(q) ||
        v.vehiclePlate.toLowerCase().includes(q) ||
        v.clientName.toLowerCase().includes(q) ||
        String(v.turnNumber).includes(q)
      const matchFilter =
        filter === 'all'    ? true :
        filter === 'active' ? !['COMPLETADO', 'PRE_REGISTRO', 'RECHAZADO'].includes(v.phase) :
        v.phase === filter
      return matchText && matchFilter
    })
  }, [vehicles, search, filter])

  const hasFilters = search || filter !== 'active'

  function handleConfirm(id: string, turnNumber: number, driverName: string, plate: string) {
    advancePhase(id, 'CONFIRMADO')
    toast.success(`Turno #${turnNumber} confirmado`, {
      description: `${driverName} — ${plate}`,
    })
    setSelectedId(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Gestión de Turnos</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Asignación y seguimiento del ciclo operacional de vehículos</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Vehículos en planta" value={kpis.vehiclesInPlant}
          icon={Truck}        iconColor="text-[#1E88E5]" iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Esperando turno"     value={kpis.turnsWaiting}
          icon={Clock}        iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="Bahías activas"      value={kpis.baysActive}
          icon={Hash}         iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Completados hoy"     value={kpis.completedToday}
          icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      {/* Table panel */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E8EDF2] px-5 py-3.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BAEC8]" />
            <Input
              placeholder="Conductor, placa o cliente…"
              className="pl-9 h-9 border-[#E8EDF2] text-sm focus:border-[#1E88E5]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#9BAEC8]" />
            <Select value={filter} onValueChange={v => setFilter(v)}>
              <SelectTrigger className="h-9 w-44 border-[#E8EDF2]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">En proceso</SelectItem>
                <SelectItem value="TURNO_ASIGNADO">Asignados</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmados</SelectItem>
                <SelectItem value="EN_PATIO">En patio</SelectItem>
                <SelectItem value="EN_BAHIA">En bahía</SelectItem>
                <SelectItem value="COMPLETADO">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilter('active') }}
              className="h-9 gap-1.5 text-[#637381] hover:text-[#1C2434]">
              <X className="h-3.5 w-3.5" /> Limpiar
            </Button>
          )}

          <p className="ml-auto text-xs text-[#9BAEC8]">{turns.length} turnos</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['#', 'Llegada', 'Conductor / Placa', 'Cliente', 'Producto', 'Tipo', 'Fase', 'Espera', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turns.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-[#F0F4F8] cursor-pointer transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''} ${v.waitingMinutes > 45 ? 'border-l-2 border-l-red-400' : ''}`}
                  onClick={() => setSelectedId(v.id)}
                >
                  {/* # */}
                  <td className="px-5 py-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C2434] text-white text-xs font-bold">
                      {v.turnNumber}
                    </div>
                  </td>
                  {/* Llegada */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-[#637381]">
                    {format(v.arrivalTime, 'HH:mm', { locale: es })}
                  </td>
                  {/* Conductor */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#1C2434]">{v.driverName}</p>
                    <p className="text-xs text-[#9BAEC8] font-mono">{v.vehiclePlate}</p>
                  </td>
                  {/* Cliente */}
                  <td className="px-5 py-3.5 max-w-[140px]">
                    <p className="truncate text-sm text-[#1C2434]">{v.clientName}</p>
                  </td>
                  {/* Producto */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-[#1C2434]">{v.productName}</p>
                    <p className="text-xs text-[#9BAEC8]">{v.qualityName}</p>
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
                  {/* Fase */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-1.5">
                      <PhasePill phase={v.phase} />
                      <CycleBar phase={v.phase} />
                    </div>
                  </td>
                  {/* Espera */}
                  <td className="px-5 py-3.5">
                    {v.waitingMinutes > 0 ? (
                      <span className={`text-sm font-medium tabular-nums ${v.waitingMinutes > 45 ? 'text-red-600 font-bold' : v.waitingMinutes > 30 ? 'text-amber-600' : 'text-[#637381]'}`}>
                        {v.waitingMinutes} min
                      </span>
                    ) : (
                      <span className="text-sm text-[#9BAEC8]">—</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {v.phase === 'TURNO_ASIGNADO' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleConfirm(v.id, v.turnNumber, v.driverName, v.vehiclePlate) }}
                          className="rounded-lg bg-[#1E88E5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1976D2] transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedId(v.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#637381] transition-colors hover:bg-[#F0F4F8] hover:text-[#1C2434]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {turns.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay turnos que coincidan con el filtro seleccionado
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
              {/* Sheet header */}
              <div className="bg-white border-b border-[#E8EDF2] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2434] text-white font-bold text-lg">
                    #{selectedVehicle.turnNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1C2434] text-lg">{selectedVehicle.driverName}</p>
                    <p className="text-sm text-[#637381] font-mono">{selectedVehicle.vehiclePlate}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <PhasePill phase={selectedVehicle.phase} />
                    <span className="text-xs text-[#9BAEC8]">
                      Llegada: {format(selectedVehicle.arrivalTime, 'HH:mm', { locale: es })}
                    </span>
                  </div>
                  <CycleBar phase={selectedVehicle.phase} />
                  <div className="flex justify-between text-[9px] text-[#9BAEC8] px-0.5">
                    {PHASE_STEPS.map(s => (
                      <span key={s}>{PHASE_META[s].short}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet body */}
              <div className="p-6 space-y-5">
                {/* Operación */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Operación</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                    <InfoRow label="Cliente"       value={selectedVehicle.clientName} />
                    <InfoRow label="Producto"      value={selectedVehicle.productName} />
                    <InfoRow label="Calidad"       value={selectedVehicle.qualityName} />
                    <InfoRow label="Tipo"          value={selectedVehicle.operationType} />
                    <InfoRow label="Tons. pedido"  value={`${selectedVehicle.requestedTons} t`} />
                    <InfoRow label="Participación" value={`${selectedVehicle.clientParticipation}%`} />
                    {selectedVehicle.assignedBay && (
                      <InfoRow label="Bahía" value={`Bahía ${selectedVehicle.assignedBay}`} />
                    )}
                    {selectedVehicle.waitingMinutes > 0 && (
                      <InfoRow label="Espera" value={
                        <span className={selectedVehicle.waitingMinutes > 45 ? 'text-red-600 font-bold' : selectedVehicle.waitingMinutes > 30 ? 'text-amber-600' : ''}>
                          {selectedVehicle.waitingMinutes} min
                          {selectedVehicle.waitingMinutes > 45 && ' ⚠ Alerta'}
                        </span>
                      } />
                    )}
                  </div>
                </div>

                {/* Conductor */}
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Conductor / Vehículo</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                    <InfoRow label="Cédula"   value={selectedVehicle.driverCedula} />
                    <InfoRow label="Licencia" value={selectedVehicle.licenseType} />
                    <InfoRow label="RUNT"     value={
                      <span className={selectedVehicle.runtValidated ? 'text-emerald-600' : 'text-red-600'}>
                        {selectedVehicle.runtValidated ? '✓ Validado' : '✗ No validado'}
                      </span>
                    } />
                    <InfoRow label="Vehículo"  value={selectedVehicle.vehicleType} />
                    <InfoRow label="Capacidad" value={`${selectedVehicle.vehicleCapacity} t`} />
                  </div>
                </div>

                {/* Confirm action */}
                {selectedVehicle.phase === 'TURNO_ASIGNADO' && (
                  <button
                    onClick={() => handleConfirm(selectedVehicle.id, selectedVehicle.turnNumber, selectedVehicle.driverName, selectedVehicle.vehiclePlate)}
                    className="w-full rounded-xl bg-[#1E88E5] py-3 text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors"
                  >
                    Confirmar Turno #{selectedVehicle.turnNumber}
                  </button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
