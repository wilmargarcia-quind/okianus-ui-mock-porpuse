import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Truck, CheckCircle2, XCircle, AlertCircle, Clock,
  Search, Filter, ArrowRight, ShieldCheck, ShieldAlert,
  FileText, Phone, CreditCard, Plus, Loader2,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useOperational } from '@/contexts/OperationalContext'
import type { OperationalVehicle } from '@/contexts/OperationalContext'
import { mockClients, mockProducts } from '@/data/mockData'
import type { VehiclePhase } from '@/types'

// ─── RUNT mock DB ─────────────────────────────────────────────────────────────

const RUNT_DB: Record<string, { name: string; lastName: string; license: string; expiry: string; phone: string; vehicleType: string; capacity: number }> = {
  '12345678': { name: 'Carlos',   lastName: 'Martínez',  license: 'C3', expiry: '2028-06', phone: '310 555 0101', vehicleType: 'Camión Cisterna', capacity: 30 },
  '87654321': { name: 'Ana',      lastName: 'Rodríguez', license: 'C2', expiry: '2027-03', phone: '320 555 0202', vehicleType: 'Tractomula Cisterna', capacity: 45 },
  '11223344': { name: 'Miguel',   lastName: 'Torres',    license: 'C3', expiry: '2029-01', phone: '300 555 0303', vehicleType: 'Camión Cisterna', capacity: 28 },
  '55667788': { name: 'Lucía',    lastName: 'Vargas',    license: 'CE', expiry: '2024-09', phone: '315 555 0404', vehicleType: 'Tractomula Cisterna', capacity: 50 },
}
type RuntStatus = 'idle' | 'checking' | 'valid' | 'invalid_cedula' | 'invalid_expired'

// ─── Phase config ─────────────────────────────────────────────────────────────

const PHASE_ORDER: VehiclePhase[] = [
  'PRE_REGISTRO','TURNO_ASIGNADO','CONFIRMADO',
  'EN_PATIO','EN_PESAJE_INICIAL','EN_BAHIA','COMPLETADO',
]

const PHASE_META: Record<VehiclePhase, { label: string; step: number; color: string; bg: string }> = {
  PRE_REGISTRO:      { label: 'Pre-registro',  step: 1, color: 'text-[#637381]',   bg: 'bg-gray-100'   },
  TURNO_ASIGNADO:    { label: 'Turno asignado',step: 2, color: 'text-amber-700',   bg: 'bg-amber-50'   },
  CONFIRMADO:        { label: 'Confirmado',    step: 3, color: 'text-blue-700',    bg: 'bg-blue-50'    },
  EN_PATIO:          { label: 'En patio',      step: 4, color: 'text-violet-700',  bg: 'bg-violet-50'  },
  EN_PESAJE_INICIAL: { label: 'Pesaje',        step: 5, color: 'text-orange-700',  bg: 'bg-orange-50'  },
  EN_BAHIA:          { label: 'En bahía',      step: 6, color: 'text-cyan-700',    bg: 'bg-cyan-50'    },
  EN_PESAJE_FINAL:   { label: 'Pesaje final',  step: 6, color: 'text-orange-700',  bg: 'bg-orange-50'  },
  ESPERANDO_SALIDA:  { label: 'Esp. salida',   step: 6, color: 'text-teal-700',    bg: 'bg-teal-50'    },
  COMPLETADO:        { label: 'Completado',    step: 7, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  RECHAZADO:         { label: 'Rechazado',     step: 0, color: 'text-red-700',     bg: 'bg-red-50'     },
}

function PhasePill({ phase }: { phase: VehiclePhase }) {
  const m = PHASE_META[phase]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.color} ${m.bg}`}>
      {phase === 'COMPLETADO' ? <CheckCircle2 className="h-3 w-3" />
        : phase === 'RECHAZADO' ? <XCircle className="h-3 w-3" />
        : <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-current/20 text-[9px] font-bold">{m.step}</span>
      }
      {m.label}
      {phase !== 'COMPLETADO' && phase !== 'RECHAZADO' && (
        <span className="opacity-40">/{PHASE_ORDER.length}</span>
      )}
    </span>
  )
}

function CycleBar({ phase }: { phase: VehiclePhase }) {
  const idx = PHASE_ORDER.indexOf(phase)
  return (
    <div className="flex items-center gap-0.5">
      {PHASE_ORDER.map((p, i) => (
        <div key={p} className={`h-1.5 flex-1 rounded-full transition-colors ${
          i < idx   ? 'bg-emerald-400'
          : i === idx ? (phase === 'COMPLETADO' ? 'bg-emerald-500' : phase === 'RECHAZADO' ? 'bg-red-400' : 'bg-[#1E88E5]')
          : 'bg-[#E8EDF2]'
        }`} />
      ))}
    </div>
  )
}

function DocDots({ docs }: { docs: OperationalVehicle['documents'] }) {
  return (
    <div className="flex items-center gap-1">
      {docs.map((doc, i) => (
        <div key={i} title={`${doc.type}: ${doc.status}`}
          className={`h-2.5 w-2.5 rounded-full border ${
            doc.status === 'validado' ? 'bg-emerald-400 border-emerald-300'
            : doc.status === 'cargado' ? 'bg-amber-400 border-amber-300'
            : 'bg-[#E8EDF2] border-[#D1D9E0]'
          }`} />
      ))}
      <span className="ml-1 text-xs text-[#9BAEC8]">
        {docs.filter(d => d.status === 'validado').length}/{docs.length}
      </span>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E8EDF2] bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E8EDF2] bg-[#F7F9FC] px-4 py-2.5">
        <Icon className="h-3.5 w-3.5 text-[#9BAEC8]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#637381]">{title}</span>
      </div>
      <div className="divide-y divide-[#E8EDF2] px-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="text-xs font-medium text-[#9BAEC8]">{label}</span>
      <span className={`text-sm font-medium text-[#1C2434] text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DriversPage() {
  const { vehicles, addVehicle, advancePhase } = useOperational()

  const [search,      setSearch]   = useState('')
  const [phaseFilter, setPhase]    = useState<string>('all')
  const [selected,    setSelected] = useState<OperationalVehicle | null>(null)

  // Nueva llegada form
  const [showNew,    setShowNew]    = useState(false)
  const [plate,      setPlate]      = useState('')
  const [cedula,     setCedula]     = useState('')
  const [runtStatus, setRuntStatus] = useState<RuntStatus>('idle')
  const [runtDriver, setRuntDriver] = useState<typeof RUNT_DB[string] | null>(null)
  const [opClient,   setOpClient]   = useState('')
  const [opProduct,  setOpProduct]  = useState('')
  const [opQuality,  setOpQuality]  = useState('')
  const [opType,     setOpType]     = useState<'CARGUE' | 'DESCARGUE'>('CARGUE')
  const [opTons,     setOpTons]     = useState('')
  const runtTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetNewForm() {
    setPlate(''); setCedula(''); setRuntStatus('idle'); setRuntDriver(null)
    setOpClient(''); setOpProduct(''); setOpQuality(''); setOpTons(''); setOpType('CARGUE')
  }

  function checkRunt() {
    if (!plate.trim() || !cedula.trim()) { toast.error('Ingresa la placa y la cédula'); return }
    setRuntStatus('checking')
    if (runtTimer.current) clearTimeout(runtTimer.current)
    runtTimer.current = setTimeout(() => {
      const found = RUNT_DB[cedula.trim()]
      if (!found) { setRuntStatus('invalid_cedula'); setRuntDriver(null); return }
      const expired = new Date(found.expiry + '-01') < new Date()
      setRuntStatus(expired ? 'invalid_expired' : 'valid')
      setRuntDriver(found)
    }, 1400)
  }

  function registerArrival() {
    if (!runtDriver) return
    const productObj = mockProducts.find(p => p.id === opProduct)
    const qualityObj = productObj?.qualities.find(q => q.id === opQuality)
    const clientObj  = mockClients.find(c => c.id === opClient)
    const nextTurn   = Math.max(...vehicles.map(v => v.turnNumber), 0) + 1
    addVehicle({
      turnNumber: nextTurn,
      driverName: `${runtDriver.name} ${runtDriver.lastName}`,
      driverCedula: cedula,
      licenseType: runtDriver.license,
      phone: runtDriver.phone,
      vehiclePlate: plate.toUpperCase(),
      vehicleType: runtDriver.vehicleType,
      vehicleCapacity: runtDriver.capacity,
      runtValidated: true,
      clientId: opClient,
      clientName: clientObj?.name ?? opClient,
      productName: productObj?.name ?? opProduct,
      qualityName: qualityObj?.name ?? opQuality,
      operationType: opType,
      requestedTons: parseFloat(opTons),
      clientParticipation: 20,
      arrivalTime: new Date(),
      waitingMinutes: 0,
      documents: [
        { type: 'Cédula / RUNT',       status: 'validado' },
        { type: 'Licencia',            status: 'validado' },
        { type: 'Manifiesto de carga', status: 'pendiente' },
        { type: 'Seguro transporte',   status: 'pendiente' },
      ],
      checklist: [],
      qualityStatus: 'PENDIENTE',
      qualityLabNotes: '',
      bayProgress: 0, tons: 0,
      exitOrderGenerated: false, exitAuthorized: false,
    })
    toast.success(`Turno #${nextTurn} asignado a ${plate.toUpperCase()}`, {
      description: `${runtDriver.name} ${runtDriver.lastName} — ${clientObj?.name}`,
    })
    setShowNew(false)
    resetNewForm()
  }

  // Filter
  const regs = vehicles.filter(v => {
    const q = search.toLowerCase()
    const txt = `${v.driverName} ${v.driverCedula} ${v.vehiclePlate} ${v.clientName}`.toLowerCase()
    return txt.includes(q) && (phaseFilter === 'all' || v.phase === phaseFilter)
  })

  const counts = {
    total:     vehicles.length,
    active:    vehicles.filter(v => !['COMPLETADO','RECHAZADO'].includes(v.phase)).length,
    completed: vehicles.filter(v => v.phase === 'COMPLETADO').length,
    pending:   vehicles.filter(v => v.phase === 'PRE_REGISTRO').length,
  }

  const runtValid = runtStatus === 'valid'
  const selectedProductObj = mockProducts.find(p => p.id === opProduct)
  const canRegister = runtValid && opClient && opProduct && opQuality && opTons && parseFloat(opTons) > 0

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Pre-registro & RUNT</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Validación de conductores, documentos y seguimiento del ciclo operacional</p>
        </div>
        <button
          onClick={() => { resetNewForm(); setShowNew(true) }}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1976D2] transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva llegada
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Registrados hoy" value={counts.total}     icon={Truck}        iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="En proceso"       value={counts.active}    icon={Clock}        iconColor="text-orange-500"  iconBg="bg-orange-50" />
        <StatCard title="Completados"      value={counts.completed} icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Pendientes docs"  value={counts.pending}   icon={AlertCircle}  iconColor="text-amber-600"   iconBg="bg-amber-50" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">
            Registros del día —&nbsp;
            <span className="font-normal text-[#637381]">{format(new Date(), "d 'de' MMMM yyyy", { locale: es })}</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9BAEC8]" />
              <Input placeholder="Conductor, cédula o placa…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-8 border-[#E8EDF2] pl-8 text-sm" />
            </div>
            <Select value={phaseFilter} onValueChange={setPhase}>
              <SelectTrigger className="h-8 w-40 border-[#E8EDF2] text-sm">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-[#9BAEC8]" />
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fases</SelectItem>
                <SelectItem value="PRE_REGISTRO">Pre-registro</SelectItem>
                <SelectItem value="TURNO_ASIGNADO">Turno asignado</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="EN_PATIO">En patio</SelectItem>
                <SelectItem value="EN_PESAJE_INICIAL">Pesaje</SelectItem>
                <SelectItem value="EN_BAHIA">En bahía</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Conductor','Cliente','Producto / Calidad','Operación','Documentos','Ciclo','Registro',''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#637381]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map((r, i) => {
                const initials = r.driverName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                const isAlert  = r.phase === 'TURNO_ASIGNADO' && r.waitingMinutes > 45
                return (
                  <tr key={r.id} onClick={() => setSelected(r)}
                    className={`cursor-pointer border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : 'bg-white'} ${isAlert ? 'border-l-2 border-l-red-400' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E88E5]/10 text-xs font-bold text-[#1E88E5]">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C2434]">{r.driverName}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#9BAEC8]">
                            <Truck className="h-3 w-3" />
                            <span className="font-mono font-medium">{r.vehiclePlate}</span>
                            {r.runtValidated
                              ? <span className="flex items-center gap-0.5 text-emerald-600"><ShieldCheck className="h-3 w-3" /> RUNT</span>
                              : <span className="flex items-center gap-0.5 text-red-500"><ShieldAlert className="h-3 w-3" /> RUNT</span>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#1C2434]">{r.clientName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-[#1C2434]">{r.productName}</p>
                      <p className="text-xs text-[#9BAEC8]">{r.qualityName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${r.operationType === 'CARGUE' ? 'bg-[#1E88E5]/10 text-[#1E88E5]' : 'bg-violet-50 text-violet-700'}`}>
                        {r.operationType}
                      </span>
                      <p className="mt-1 text-xs text-[#9BAEC8]">{r.requestedTons} t</p>
                    </td>
                    <td className="px-5 py-3.5"><DocDots docs={r.documents} /></td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <PhasePill phase={r.phase} />
                      <div className="mt-2 w-28"><CycleBar phase={r.phase} /></div>
                      {isAlert && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-500">
                          <AlertCircle className="h-3 w-3" />{r.waitingMinutes} min esperando
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9BAEC8]">
                      {format(r.registeredAt, 'HH:mm', { locale: es })}
                    </td>
                    <td className="px-3 py-3.5"><ArrowRight className="h-4 w-4 text-[#C8D5E0]" /></td>
                  </tr>
                )
              })}
              {regs.length === 0 && (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-[#9BAEC8]">No se encontraron registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#E8EDF2] px-5 py-3 text-xs text-[#9BAEC8]">
          {regs.length} de {vehicles.length} registros
        </div>
      </div>

      {/* ── Nueva Llegada Sheet ────────────────────────────────────────────── */}
      <Sheet open={showNew} onOpenChange={open => { if (!open) { setShowNew(false); resetNewForm() } }}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">
          <div className="bg-white border-b border-[#E8EDF2] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E88E5]/10">
                <Truck className="h-5 w-5 text-[#1E88E5]" />
              </div>
              <div>
                <p className="font-bold text-[#1C2434] text-base">Nueva llegada al terminal</p>
                <p className="text-xs text-[#9BAEC8]">Verificación RUNT y registro de operación</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Step 1 */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Paso 1 — Identificación</p>
              <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#637381]">Placa del vehículo</Label>
                  <input value={plate} onChange={e => { setPlate(e.target.value.toUpperCase()); setRuntStatus('idle') }}
                    placeholder="Ej: ABC-123"
                    className="w-full rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] px-3 py-2.5 text-sm font-mono font-bold text-[#1C2434] uppercase placeholder:font-normal placeholder:normal-case focus:border-[#1E88E5] focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#637381]">Cédula del conductor</Label>
                  <input value={cedula} onChange={e => { setCedula(e.target.value); setRuntStatus('idle') }}
                    placeholder="Número de cédula"
                    className="w-full rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] px-3 py-2.5 text-sm text-[#1C2434] focus:border-[#1E88E5] focus:outline-none" />
                </div>
                <button onClick={checkRunt} disabled={runtStatus === 'checking' || !plate || !cedula}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-[#1C2434] text-white hover:bg-[#0D2137]">
                  {runtStatus === 'checking'
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Consultando RUNT…</>
                    : <><ShieldCheck className="h-4 w-4" /> Verificar en RUNT</>}
                </button>
              </div>
            </div>

            {/* RUNT results */}
            {runtStatus === 'valid' && runtDriver && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <ShieldCheck className="h-4 w-4" /> RUNT validado correctamente
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div><span className="text-emerald-600">Conductor</span><p className="font-semibold text-[#1C2434] mt-0.5">{runtDriver.name} {runtDriver.lastName}</p></div>
                  <div><span className="text-emerald-600">Licencia</span><p className="font-semibold text-[#1C2434] mt-0.5">{runtDriver.license} — {runtDriver.expiry}</p></div>
                  <div><span className="text-emerald-600">Teléfono</span><p className="font-semibold text-[#1C2434] mt-0.5">{runtDriver.phone}</p></div>
                  <div><span className="text-emerald-600">Vehículo</span><p className="font-semibold text-[#1C2434] mt-0.5">{runtDriver.vehicleType} · {runtDriver.capacity} t</p></div>
                </div>
              </div>
            )}
            {runtStatus === 'invalid_cedula' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Conductor no encontrado en RUNT</p>
                  <p className="text-xs text-red-600 mt-0.5">Cédula {cedula} no registra. Verifica e intenta de nuevo.</p>
                </div>
              </div>
            )}
            {runtStatus === 'invalid_expired' && runtDriver && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">{runtDriver.name} {runtDriver.lastName} — Licencia vencida</p>
                  <p className="text-xs text-amber-600 mt-0.5">Licencia {runtDriver.license} venció en {runtDriver.expiry}. No puede ingresar.</p>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {runtValid && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9BAEC8]">Paso 2 — Datos de la operación</p>
                <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#637381]">Tipo de operación</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['CARGUE', 'DESCARGUE'] as const).map(t => (
                        <button key={t} onClick={() => setOpType(t)}
                          className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                            opType === t
                              ? t === 'CARGUE' ? 'border-[#1E88E5] bg-[#1E88E5]/10 text-[#1E88E5]' : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-[#E8EDF2] bg-[#F7F9FC] text-[#637381] hover:border-[#D1D9E0]'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#637381]">Cliente</Label>
                    <Select value={opClient} onValueChange={setOpClient}>
                      <SelectTrigger className="h-9 border-[#E8EDF2] text-sm"><SelectValue placeholder="Seleccionar cliente…" /></SelectTrigger>
                      <SelectContent>
                        {mockClients.filter(c => c.active).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#637381]">Producto</Label>
                    <Select value={opProduct} onValueChange={v => { setOpProduct(v); setOpQuality('') }}>
                      <SelectTrigger className="h-9 border-[#E8EDF2] text-sm"><SelectValue placeholder="Seleccionar producto…" /></SelectTrigger>
                      <SelectContent>
                        {mockProducts.filter(p => p.active).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProductObj && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[#637381]">Calidad</Label>
                      <Select value={opQuality} onValueChange={setOpQuality}>
                        <SelectTrigger className="h-9 border-[#E8EDF2] text-sm"><SelectValue placeholder="Seleccionar calidad…" /></SelectTrigger>
                        <SelectContent>
                          {selectedProductObj.qualities.filter(q => q.active).map(q => <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#637381]">Toneladas solicitadas</Label>
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.5" min="0.5" value={opTons} onChange={e => setOpTons(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] px-3 py-2 text-right text-sm font-semibold text-[#1C2434] tabular-nums focus:border-[#1E88E5] focus:outline-none" />
                      <span className="text-sm text-[#637381] font-medium">t</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {runtValid && (
              <button onClick={registerArrival} disabled={!canRegister}
                className="w-full rounded-xl bg-[#1E88E5] py-3 text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Registrar llegada y asignar turno
              </button>
            )}
            <p className="text-center text-[11px] text-[#C8D5E0]">
              Demo: cédulas 12345678 · 87654321 · 11223344
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Detail Sheet ───────────────────────────────────────────────────── */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-[#E8EDF2] p-0 bg-[#F7F9FC]">
          {selected && (() => {
            const pct      = Math.round(selected.documents.filter(d => d.status === 'validado').length / Math.max(selected.documents.length, 1) * 100)
            const initials = selected.driverName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            const isAlert  = selected.phase === 'TURNO_ASIGNADO' && selected.waitingMinutes > 45
            return (
              <>
                <div className="border-b border-[#E8EDF2] bg-white px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5] text-sm font-bold text-white">{initials}</div>
                    <div>
                      <h3 className="text-base font-bold text-[#1C2434]">{selected.driverName}</h3>
                      <p className="text-xs text-[#637381]">
                        <span className="font-mono font-semibold">{selected.vehiclePlate}</span> · Turno #{selected.turnNumber}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      {isAlert
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertCircle className="h-3.5 w-3.5" />{selected.waitingMinutes} min esperando</span>
                        : <span className="text-xs text-[#9BAEC8]">Fase actual</span>
                      }
                      <PhasePill phase={selected.phase} />
                    </div>
                    <CycleBar phase={selected.phase} />
                    <div className="flex justify-between text-[10px] text-[#C8D5E0]">
                      {PHASE_ORDER.slice(0, -1).map((p, i) => <span key={p}>{i + 1}</span>)}
                      <span>{PHASE_ORDER.length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <SectionCard title="Conductor" icon={CreditCard}>
                    <InfoRow label="Nombre completo" value={selected.driverName} />
                    <InfoRow label="Cédula" value={selected.driverCedula} mono />
                    <InfoRow label="Licencia" value={selected.licenseType} />
                    <InfoRow label="Teléfono" value={<span className="flex items-center gap-1"><Phone className="h-3 w-3 text-[#9BAEC8]" />{selected.phone || '—'}</span>} />
                    <InfoRow label="RUNT" value={selected.runtValidated
                      ? <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" />Validado</span>
                      : <span className="flex items-center gap-1 text-red-500"><ShieldAlert className="h-3.5 w-3.5" />No validado</span>
                    } />
                  </SectionCard>

                  <SectionCard title="Vehículo y operación" icon={Truck}>
                    <InfoRow label="Placa"       value={selected.vehiclePlate} mono />
                    <InfoRow label="Tipo"        value={selected.vehicleType} />
                    <InfoRow label="Capacidad"   value={`${selected.vehicleCapacity} t`} />
                    <InfoRow label="Operación"   value={
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${selected.operationType === 'CARGUE' ? 'bg-[#1E88E5]/10 text-[#1E88E5]' : 'bg-violet-50 text-violet-700'}`}>
                        {selected.operationType}
                      </span>} />
                    <InfoRow label="Producto"    value={selected.productName} />
                    <InfoRow label="Calidad"     value={selected.qualityName} />
                    <InfoRow label="Toneladas"   value={`${selected.requestedTons} t`} />
                    {selected.assignedBay && <InfoRow label="Bahía" value={`Bahía ${selected.assignedBay}`} />}
                  </SectionCard>

                  <SectionCard title="Documentos" icon={FileText}>
                    {selected.documents.map(doc => (
                      <div key={doc.type} className="flex items-center justify-between py-2.5">
                        <span className="text-xs font-medium text-[#9BAEC8]">{doc.type}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          doc.status === 'validado' ? 'bg-emerald-50 text-emerald-700'
                          : doc.status === 'cargado' ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${doc.status === 'validado' ? 'bg-emerald-500' : doc.status === 'cargado' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </div>
                    ))}
                    <div className="py-3">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-[#9BAEC8]">Validación completada</span>
                        <span className={`font-semibold ${pct === 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F4F8]">
                        <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Advance phase */}
                  {selected.phase === 'PRE_REGISTRO' && (
                    <button onClick={() => { advancePhase(selected.id, 'TURNO_ASIGNADO', { turnNumber: selected.turnNumber }); toast.success(`Turno #${selected.turnNumber} asignado`); setSelected(null) }}
                      className="w-full rounded-xl bg-[#1E88E5] py-3 text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors">
                      Asignar turno #{selected.turnNumber}
                    </button>
                  )}

                  <p className="text-center text-xs text-[#C8D5E0]">
                    Registrado el {format(selected.registeredAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>
    </div>
  )
}
