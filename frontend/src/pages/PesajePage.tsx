import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Scale, CheckCircle2, Clock, AlertCircle, Search, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useOperational, type OperationalVehicle } from '@/contexts/OperationalContext'

// ─── status derivation ───────────────────────────────────────────────────────

type WeighStatus = 'ESPERANDO_INICIAL' | 'INICIAL_REGISTRADO' | 'ESPERANDO_FINAL' | 'COMPLETADO'

function getWeighStatus(v: OperationalVehicle): WeighStatus {
  if (v.phase === 'EN_PESAJE_INICIAL') return 'ESPERANDO_INICIAL'
  if (v.phase === 'EN_PESAJE_FINAL')   return 'ESPERANDO_FINAL'
  if (v.netWeight != null)             return 'COMPLETADO'
  if (v.initialWeight != null)        return 'INICIAL_REGISTRADO'
  return 'COMPLETADO'
}

// ─── pill ─────────────────────────────────────────────────────────────────────

const STATUS_META: Record<WeighStatus, { label: string; cls: string; dot: string }> = {
  ESPERANDO_INICIAL:  { label: 'Esp. inicial', cls: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
  INICIAL_REGISTRADO: { label: 'Inicial ok',   cls: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  ESPERANDO_FINAL:    { label: 'Esp. final',   cls: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-500' },
  COMPLETADO:         { label: 'Completado',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

function StatusPill({ status }: { status: WeighStatus }) {
  const m = STATUS_META[status]
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

// ─── component ────────────────────────────────────────────────────────────────

export default function PesajePage() {
  const { vehicles, advancePhase } = useOperational()
  const [search,     setSearch]     = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [weight,     setWeight]     = useState('')

  const selectedVehicle = vehicles.find(v => v.id === selectedId) ?? null

  // Show vehicles currently at weighing phases or that have completed weighing
  const weighingVehicles = useMemo(() =>
    vehicles.filter(v =>
      ['EN_PESAJE_INICIAL', 'EN_PESAJE_FINAL'].includes(v.phase) ||
      (v.initialWeight != null)
    ),
  [vehicles])

  const totals = useMemo(() => ({
    total:      weighingVehicles.length,
    waiting:    vehicles.filter(v => v.phase === 'EN_PESAJE_INICIAL').length,
    inProgress: vehicles.filter(v => v.phase === 'EN_PESAJE_FINAL').length,
    completed:  weighingVehicles.filter(v => v.netWeight != null).length,
  }), [vehicles, weighingVehicles])

  const records = useMemo(() => {
    const q = search.toLowerCase()
    return weighingVehicles.filter(v =>
      v.driverName.toLowerCase().includes(q) ||
      v.vehiclePlate.toLowerCase().includes(q) ||
      v.clientName.toLowerCase().includes(q)
    )
  }, [weighingVehicles, search])

  function openRecord(v: OperationalVehicle) {
    setSelectedId(v.id)
    setWeight('')
  }

  function handleRegisterWeight() {
    if (!selectedVehicle) return
    const val = parseFloat(weight)
    if (isNaN(val) || val <= 0) {
      toast.error('Ingresa un peso válido en toneladas')
      return
    }

    const isInitial = selectedVehicle.phase === 'EN_PESAJE_INICIAL'

    if (isInitial) {
      advancePhase(selectedVehicle.id, 'EN_BAHIA', {
        initialWeight:     val,
        initialWeightTime: new Date(),
      })
      toast.success(`Peso inicial registrado: ${val.toFixed(1)} t`, {
        description: `${selectedVehicle.vehiclePlate} — ingresa a Bahía ${selectedVehicle.assignedBay ?? '?'}`,
      })
    } else {
      const net = Math.abs(val - (selectedVehicle.initialWeight ?? 0))
      advancePhase(selectedVehicle.id, 'ESPERANDO_SALIDA', {
        finalWeight:     val,
        finalWeightTime: new Date(),
        netWeight:       net,
        tons:            net,
      })
      toast.success(`Peso final registrado. Neto: ${net.toFixed(1)} t`, {
        description: `${selectedVehicle.vehiclePlate} — ${selectedVehicle.clientName}`,
      })
    }
    setSelectedId(null)
  }

  const isInitial   = selectedVehicle?.phase === 'EN_PESAJE_INICIAL'
  const needsWeight = selectedVehicle?.phase === 'EN_PESAJE_INICIAL' || selectedVehicle?.phase === 'EN_PESAJE_FINAL'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">Báscula — Pesaje</h1>
        <p className="mt-0.5 text-sm text-[#637381]">
          Registro de pesos inicial y final. El peso neto genera el movimiento de inventario.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Registros hoy"  value={totals.total}
          icon={Scale}        iconColor="text-[#1E88E5]" iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Esp. pesaje"    value={totals.waiting}
          icon={Clock}        iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="En progreso"    value={totals.inProgress}
          icon={AlertCircle}  iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Completados"    value={totals.completed}
          icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      {/* Table panel */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Registros de pesaje</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BAEC8]" />
            <Input
              placeholder="Conductor, placa o cliente…"
              className="pl-9 h-9 border-[#E8EDF2] text-sm focus:border-[#1E88E5]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Turno', 'Conductor / Placa', 'Cliente / Producto', 'Tipo', 'Inicial (t)', 'Final (t)', 'Neto (t)', 'Estado', ''].map((h, idx) => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${idx >= 4 && idx <= 6 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-[#F0F4F8] cursor-pointer transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}
                  onClick={() => openRecord(v)}
                >
                  {/* Turno */}
                  <td className="px-5 py-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C2434] text-white text-xs font-bold">
                      {v.turnNumber}
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
                  {/* Inicial */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm tabular-nums text-[#637381]">
                      {v.initialWeight != null ? v.initialWeight.toFixed(1) : '—'}
                    </span>
                  </td>
                  {/* Final */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm tabular-nums text-[#637381]">
                      {v.finalWeight != null ? v.finalWeight.toFixed(1) : '—'}
                    </span>
                  </td>
                  {/* Neto */}
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-semibold tabular-nums ${v.netWeight != null ? 'text-[#1C2434]' : 'text-[#9BAEC8]'}`}>
                      {v.netWeight != null ? v.netWeight.toFixed(1) : '—'}
                    </span>
                  </td>
                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <StatusPill status={getWeighStatus(v)} />
                  </td>
                  {/* Arrow */}
                  <td className="px-5 py-3.5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] transition-colors hover:bg-[#F0F4F8] hover:text-[#1C2434]">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay registros de pesaje
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C2434] text-white font-bold text-lg">
                    {selectedVehicle.turnNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1C2434] text-lg">{selectedVehicle.driverName}</p>
                    <p className="text-sm text-[#637381] font-mono">{selectedVehicle.vehiclePlate}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <StatusPill status={getWeighStatus(selectedVehicle)} />
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Operation info */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Operación</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                    <InfoRow label="Cliente"    value={selectedVehicle.clientName} />
                    <InfoRow label="Producto"   value={selectedVehicle.productName} />
                    <InfoRow label="Calidad"    value={selectedVehicle.qualityName} />
                    <InfoRow label="Tipo"       value={selectedVehicle.operationType} />
                    <InfoRow label="Solicitado" value={`${selectedVehicle.requestedTons} t`} />
                    {selectedVehicle.assignedBay && (
                      <InfoRow label="Bahía" value={`Bahía ${selectedVehicle.assignedBay}`} />
                    )}
                  </div>
                </div>

                {/* Weight summary */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Registro de pesos</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white overflow-hidden shadow-sm">
                    {/* Peso inicial */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F4F8]">
                      <div>
                        <p className="text-xs text-[#9BAEC8]">Peso inicial</p>
                        {selectedVehicle.initialWeightTime && (
                          <p className="text-[10px] text-[#9BAEC8]">
                            {format(selectedVehicle.initialWeightTime, 'HH:mm', { locale: es })}
                          </p>
                        )}
                      </div>
                      <span className={`text-lg font-bold tabular-nums ${selectedVehicle.initialWeight != null ? 'text-[#1C2434]' : 'text-[#9BAEC8]'}`}>
                        {selectedVehicle.initialWeight != null ? `${selectedVehicle.initialWeight.toFixed(1)} t` : '—'}
                      </span>
                    </div>
                    {/* Peso final */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F4F8]">
                      <div>
                        <p className="text-xs text-[#9BAEC8]">Peso final</p>
                        {selectedVehicle.finalWeightTime && (
                          <p className="text-[10px] text-[#9BAEC8]">
                            {format(selectedVehicle.finalWeightTime, 'HH:mm', { locale: es })}
                          </p>
                        )}
                      </div>
                      <span className={`text-lg font-bold tabular-nums ${selectedVehicle.finalWeight != null ? 'text-[#1C2434]' : 'text-[#9BAEC8]'}`}>
                        {selectedVehicle.finalWeight != null ? `${selectedVehicle.finalWeight.toFixed(1)} t` : '—'}
                      </span>
                    </div>
                    {/* Neto */}
                    {selectedVehicle.netWeight != null && (
                      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                        <p className="text-sm font-semibold text-emerald-700">Peso neto</p>
                        <span className="text-2xl font-bold tabular-nums text-emerald-700">
                          {selectedVehicle.netWeight.toFixed(1)} t
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Register weight */}
                {needsWeight && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">
                      {isInitial ? 'Registrar peso inicial' : 'Registrar peso final'}
                    </p>
                    <div className="rounded-xl border border-[#E8EDF2] bg-white p-4 space-y-3 shadow-sm">
                      <div className="flex gap-3 items-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className="flex-1 rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] px-4 py-2.5 text-right text-2xl font-bold text-[#1C2434] tabular-nums focus:border-[#1E88E5] focus:outline-none"
                        />
                        <div className="text-sm text-[#637381] font-medium">t</div>
                      </div>
                      <button
                        onClick={handleRegisterWeight}
                        disabled={!weight}
                        className="w-full rounded-xl bg-[#1E88E5] py-3 text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Scale className="h-4 w-4" />
                        Registrar {isInitial ? 'peso inicial' : 'peso final'}
                      </button>
                      <p className="text-xs text-[#9BAEC8] text-center">
                        Ingresa el peso en toneladas tal como aparece en la báscula
                      </p>
                    </div>
                  </div>
                )}

                {selectedVehicle.netWeight != null && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Pesaje completado. El movimiento de inventario ha sido registrado.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
