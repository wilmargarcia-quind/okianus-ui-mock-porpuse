import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CheckCircle2, XCircle, AlertCircle, ClipboardList,
  FlaskConical, Search, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useOperational, type OperationalVehicle } from '@/contexts/OperationalContext'

// ─── status derivation ───────────────────────────────────────────────────────

type PatioStatus = 'EN_CHECKLIST' | 'EN_CALIDAD' | 'APROBADO' | 'RECHAZADO'

function getPatioStatus(v: OperationalVehicle): PatioStatus {
  const allRequired = v.checklist.filter(c => c.required).every(c => c.checked)
  if (!allRequired) return 'EN_CHECKLIST'
  if (v.qualityStatus === 'RECHAZADO') return 'RECHAZADO'
  if (v.qualityStatus === 'PENDIENTE') return 'EN_CALIDAD'
  return 'APROBADO'
}

// ─── pill components ──────────────────────────────────────────────────────────

const STATUS_META: Record<PatioStatus, { label: string; cls: string; dot: string }> = {
  EN_CHECKLIST: { label: 'Checklist',  cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  EN_CALIDAD:   { label: 'En calidad', cls: 'bg-violet-50 text-violet-700 border-violet-200',    dot: 'bg-violet-500' },
  APROBADO:     { label: 'Aprobado',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  RECHAZADO:    { label: 'Rechazado',  cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' },
}

type QualityStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

const QUALITY_META: Record<QualityStatus, { label: string; cls: string }> = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  APROBADO:  { label: 'Aprobado',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RECHAZADO: { label: 'Rechazado', cls: 'bg-red-50 text-red-700 border-red-200' },
}

function StatusPill({ status }: { status: PatioStatus }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function QualityPill({ status }: { status: QualityStatus }) {
  const m = QUALITY_META[status]
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  )
}

const CATEGORY_ORDER = ['CONDUCTOR', 'VEHICULO', 'DOCUMENTOS', 'SEGURIDAD'] as const
const CATEGORY_LABELS: Record<string, string> = {
  CONDUCTOR: 'Conductor', VEHICULO: 'Vehículo',
  DOCUMENTOS: 'Documentos', SEGURIDAD: 'Seguridad',
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

export default function PatioPage() {
  const { vehicles, advancePhase, updateVehicle } = useOperational()
  const [search,     setSearch]     = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [labNotes,   setLabNotes]   = useState('')

  const selectedVehicle = vehicles.find(v => v.id === selectedId) ?? null

  // Vehicles currently in patio phase
  const patioVehicles = useMemo(() =>
    vehicles.filter(v => v.phase === 'EN_PATIO'),
  [vehicles])

  const totals = useMemo(() => ({
    total:       patioVehicles.length,
    enChecklist: patioVehicles.filter(v => !v.checklist.filter(c => c.required).every(c => c.checked)).length,
    enCalidad:   patioVehicles.filter(v => v.checklist.filter(c => c.required).every(c => c.checked) && v.qualityStatus === 'PENDIENTE').length,
    aprobados:   patioVehicles.filter(v => v.qualityStatus === 'APROBADO').length,
  }), [patioVehicles])

  const records = useMemo(() => {
    const q = search.toLowerCase()
    return patioVehicles.filter(v =>
      v.driverName.toLowerCase().includes(q) ||
      v.vehiclePlate.toLowerCase().includes(q) ||
      v.clientName.toLowerCase().includes(q)
    )
  }, [patioVehicles, search])

  function openRecord(v: OperationalVehicle) {
    setSelectedId(v.id)
    setLabNotes(v.qualityLabNotes ?? '')
  }

  // Toggle checklist item — updates context immediately so progress persists
  function toggleItem(itemId: string) {
    if (!selectedVehicle) return
    const newChecklist = selectedVehicle.checklist.map(c =>
      c.id === itemId ? { ...c, checked: !c.checked } : c
    )
    updateVehicle(selectedVehicle.id, { checklist: newChecklist })
  }

  function handleApprove() {
    if (!selectedVehicle) return
    // Find next available bay
    const usedBays = vehicles
      .filter(v => ['EN_BAHIA', 'EN_PESAJE_FINAL', 'ESPERANDO_SALIDA'].includes(v.phase) && v.assignedBay)
      .map(v => v.assignedBay!)
    const nextBay = [1, 2, 3, 4, 5, 6].find(b => !usedBays.includes(b)) ?? 1

    advancePhase(selectedVehicle.id, 'EN_PESAJE_INICIAL', {
      qualityStatus: 'APROBADO',
      qualityLabNotes: labNotes,
      assignedBay: nextBay,
    })
    toast.success('Vehículo aprobado y asignado a bahía', {
      description: `${selectedVehicle.vehiclePlate} → Bahía ${nextBay} — ${selectedVehicle.clientName}`,
    })
    setSelectedId(null)
  }

  function handleReject() {
    if (!selectedVehicle) return
    advancePhase(selectedVehicle.id, 'RECHAZADO', {
      qualityStatus: 'RECHAZADO',
      qualityLabNotes: labNotes,
    })
    toast.error('Vehículo rechazado', {
      description: `${selectedVehicle.vehiclePlate} — ${selectedVehicle.clientName}`,
    })
    setSelectedId(null)
  }

  // Derived checklist stats from live context (not local state)
  const checkedCount   = selectedVehicle?.checklist.filter(c => c.checked).length ?? 0
  const checklistTotal = selectedVehicle?.checklist.length ?? 0
  const checklistPct   = checklistTotal > 0 ? Math.round(checkedCount / checklistTotal * 100) : 0
  const allRequired    = selectedVehicle?.checklist.filter(c => c.required).every(c => c.checked) ?? false

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">Control de Patio</h1>
        <p className="mt-0.5 text-sm text-[#637381]">Checklist de ingreso y validación de calidad de laboratorio</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total en patio"  value={totals.total}
          icon={ClipboardList} iconColor="text-[#1E88E5]" iconBg="bg-[#1E88E5]/10" />
        <StatCard title="En checklist"    value={totals.enChecklist}
          icon={ClipboardList} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="En calidad"      value={totals.enCalidad}
          icon={FlaskConical}  iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Aprobados"       value={totals.aprobados}
          icon={CheckCircle2}  iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      {/* Table panel */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Vehículos en patio</p>
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
                {['Turno', 'Conductor / Placa', 'Cliente / Producto', 'Tipo', 'Checklist', 'Calidad', 'Estado', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((v, i) => {
                const pct    = Math.round(v.checklist.filter(c => c.checked).length / v.checklist.length * 100)
                const status = getPatioStatus(v)
                return (
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
                    {/* Checklist */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-1.5 rounded-full bg-[#E8EDF2] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-[#1E88E5]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums text-[#637381] w-8">{pct}%</span>
                      </div>
                    </td>
                    {/* Calidad */}
                    <td className="px-5 py-3.5">
                      <QualityPill status={v.qualityStatus} />
                    </td>
                    {/* Estado */}
                    <td className="px-5 py-3.5">
                      <StatusPill status={status} />
                    </td>
                    {/* Arrow */}
                    <td className="px-5 py-3.5">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] transition-colors hover:bg-[#F0F4F8] hover:text-[#1C2434]">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay vehículos en patio
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedVehicle} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto bg-[#F7F9FC]">
          {selectedVehicle && (
            <>
              {/* Sheet header */}
              <div className="bg-white border-b border-[#E8EDF2] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C2434] text-white font-bold text-lg">
                    {selectedVehicle.turnNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1C2434] text-lg">{selectedVehicle.driverName}</p>
                    <p className="text-sm text-[#637381]">{selectedVehicle.vehiclePlate} · {selectedVehicle.clientName}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusPill status={getPatioStatus(selectedVehicle)} />
                  {selectedVehicle.entryTime && (
                    <span className="text-xs text-[#9BAEC8]">
                      Ingreso: {format(selectedVehicle.entryTime, 'HH:mm', { locale: es })}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Operation summary */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Operación</p>
                  <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                    <InfoRow label="Producto"  value={selectedVehicle.productName} />
                    <InfoRow label="Calidad"   value={selectedVehicle.qualityName} />
                    <InfoRow label="Operación" value={selectedVehicle.operationType} />
                    <InfoRow label="Toneladas" value={`${selectedVehicle.requestedTons} t`} />
                    {selectedVehicle.assignedBay && (
                      <InfoRow label="Bahía" value={`Bahía ${selectedVehicle.assignedBay}`} />
                    )}
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">
                      Checklist de ingreso
                    </p>
                    <span className="text-xs font-medium text-[#637381]">{checkedCount}/{checklistTotal}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#E8EDF2] overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all ${checklistPct === 100 ? 'bg-emerald-500' : 'bg-[#1E88E5]'}`}
                      style={{ width: `${checklistPct}%` }}
                    />
                  </div>

                  {CATEGORY_ORDER.map(cat => {
                    const items = selectedVehicle.checklist.filter(c => c.category === cat)
                    if (!items.length) return null
                    return (
                      <div key={cat} className="mb-4">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9BAEC8]">
                          {CATEGORY_LABELS[cat]}
                        </p>
                        <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                              <Checkbox
                                id={item.id}
                                checked={item.checked}
                                onCheckedChange={() => toggleItem(item.id)}
                              />
                              <Label htmlFor={item.id} className="flex-1 text-sm text-[#1C2434] cursor-pointer leading-tight">
                                {item.label}
                                {item.required && <span className="text-red-500 ml-0.5 text-xs">*</span>}
                              </Label>
                              {item.checked
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                : <div className="h-4 w-4 shrink-0" />
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Lab quality */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">
                      Calidad de laboratorio
                    </p>
                    <QualityPill status={selectedVehicle.qualityStatus} />
                  </div>
                  <Textarea
                    className="text-sm border-[#E8EDF2] focus:border-[#1E88E5] resize-none"
                    rows={3}
                    placeholder="Registrar observaciones del laboratorio…"
                    value={labNotes}
                    onChange={e => setLabNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={!allRequired}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar y asignar bahía
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar vehículo
                  </button>
                  {!allRequired && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Complete todos los ítems obligatorios (*) para aprobar
                    </p>
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
