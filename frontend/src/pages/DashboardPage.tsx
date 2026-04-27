import { useMemo } from 'react'
import {
  Package, Users, ArrowLeftRight, Gauge, ArrowUpRight,
  Truck, Clock, AlertTriangle, CheckCircle2, Hash,
  ChevronRight, ClipboardList, Scale, Anchor, LogOut, BookOpen,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  getDashboardStats, getMovementChartData, getProductDistribution,
  getClientBalances, mockMovements, formatNumber, formatTons,
} from '@/data/mockData'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'
import { useOperational, type OperationalVehicle } from '@/contexts/OperationalContext'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'
import type { VehiclePhase } from '@/types'

// ─── shared helpers ───────────────────────────────────────────────────────────

const stats           = getDashboardStats()
const movementData    = getMovementChartData()
const productDistrib  = getProductDistribution()
const clientBalances  = getClientBalances()
const recentMovements = mockMovements.slice(0, 8)

function TypeBadge({ type }: { type: string }) {
  const cfg = {
    ENTRADA: { label: 'Entrada', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    SALIDA:  { label: 'Salida',  cls: 'bg-red-50 text-red-700 border-red-100' },
    AJUSTE:  { label: 'Ajuste',  cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }[type] ?? { label: type, cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── OPERATOR DASHBOARD ───────────────────────────────────────────────────────

const PHASE_NAV: {
  phase: VehiclePhase | 'multi'
  label: string
  desc: string
  link: string
  icon: React.ElementType
  color: string
  bg: string
}[] = [
  { phase: 'PRE_REGISTRO',      label: 'Registro / Turnos', desc: 'Nuevas llegadas y asignación de turnos', link: '/drivers',  icon: Truck,         color: 'text-[#1E88E5]', bg: 'bg-[#1E88E5]/10' },
  { phase: 'EN_PATIO',          label: 'Control de Patio',  desc: 'Checklist de ingreso y calidad de lab',  link: '/patio',    icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
  { phase: 'EN_PESAJE_INICIAL', label: 'Pesaje',            desc: 'Registro de pesos inicial y final',      link: '/pesaje',   icon: Scale,         color: 'text-violet-600', bg: 'bg-violet-50' },
  { phase: 'EN_BAHIA',          label: 'Bahía',             desc: 'Cargue/descargue y autorización salida', link: '/bahia',    icon: Anchor,        color: 'text-cyan-600', bg: 'bg-cyan-50' },
]

function OperatorDashboard({ vehicles }: { vehicles: OperationalVehicle[] }) {
  const now = new Date()
  const { startTour } = useOnboardingTour()

  const counts = useMemo(() => ({
    preRegistro:  vehicles.filter(v => v.phase === 'PRE_REGISTRO').length,
    turnoAsig:    vehicles.filter(v => v.phase === 'TURNO_ASIGNADO').length,
    confirmado:   vehicles.filter(v => v.phase === 'CONFIRMADO').length,
    enPatio:      vehicles.filter(v => v.phase === 'EN_PATIO').length,
    pesaje:       vehicles.filter(v => ['EN_PESAJE_INICIAL', 'EN_PESAJE_FINAL'].includes(v.phase)).length,
    enBahia:      vehicles.filter(v => v.phase === 'EN_BAHIA').length,
    espSalida:    vehicles.filter(v => v.phase === 'ESPERANDO_SALIDA').length,
    completado:   vehicles.filter(v => v.phase === 'COMPLETADO').length,
    rechazado:    vehicles.filter(v => v.phase === 'RECHAZADO').length,
  }), [vehicles])

  const inPlant = vehicles.filter(v => !['PRE_REGISTRO', 'COMPLETADO', 'RECHAZADO'].includes(v.phase))
  const overdue = vehicles.filter(v => v.waitingMinutes > 45)

  // Phase nav counts
  const phaseCount = (phase: VehiclePhase | 'multi') => {
    if (phase === 'PRE_REGISTRO')      return counts.preRegistro + counts.turnoAsig + counts.confirmado
    if (phase === 'EN_PATIO')          return counts.enPatio
    if (phase === 'EN_PESAJE_INICIAL') return counts.pesaje
    if (phase === 'EN_BAHIA')          return counts.enBahia + counts.espSalida
    return 0
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Panel Operativo</h1>
          <p className="mt-0.5 text-sm text-[#637381]">
            {format(now, "EEEE d 'de' MMMM · HH:mm", { locale: es })} — estado del ciclo en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={startTour}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8EDF2] bg-white px-4 py-2.5 text-sm font-semibold text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Guía rápida
          </button>
          <Link to="/drivers"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1C2434] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors">
            <Truck className="h-4 w-4" />
            Nueva llegada
          </Link>
        </div>
      </div>

      {/* ALERT BANNER for overdue vehicles */}
      {overdue.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {overdue.length} {overdue.length === 1 ? 'vehículo lleva' : 'vehículos llevan'} más de 45 min esperando
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {overdue.map(v => (
                  <Link key={v.id} to="/drivers"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors">
                    <span className="font-mono">{v.vehiclePlate}</span>
                    <span className="text-red-500">·</span>
                    <span className="font-bold">{v.waitingMinutes} min</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="En planta ahora"    value={inPlant.length}
          icon={Truck}         iconColor="text-[#1E88E5]" iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Esperando turno"    value={counts.turnoAsig}
          icon={Clock}         iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="Bahías activas"     value={counts.enBahia}
          icon={Hash}          iconColor="text-cyan-600"  iconBg="bg-cyan-50" />
        <StatCard title="Completados hoy"    value={counts.completado}
          icon={CheckCircle2}  iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      {/* Phase navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PHASE_NAV.map(nav => {
          const count = phaseCount(nav.phase)
          return (
            <Link key={nav.link} to={nav.link}
              className="group rounded-xl border border-[#E8EDF2] bg-white shadow-sm p-5 hover:shadow-md hover:border-[#1E88E5]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${nav.bg}`}>
                  <nav.icon className={`h-5 w-5 ${nav.color}`} />
                </div>
                {count > 0 && (
                  <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-[#1E88E5] text-white text-xs font-bold px-1.5">
                    {count}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#1C2434] group-hover:text-[#1E88E5] transition-colors">{nav.label}</p>
              <p className="mt-1 text-xs text-[#9BAEC8]">{nav.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#9BAEC8] group-hover:text-[#1E88E5] transition-colors">
                Abrir <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Active vehicles table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Vehículos activos</p>
          <Link to="/drivers" className="flex items-center gap-1 text-xs font-medium text-[#1E88E5] hover:underline">
            Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['#', 'Conductor / Placa', 'Cliente', 'Fase', 'Espera', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inPlant.slice(0, 6).map((v, i) => {
                const PHASE_LABELS: Partial<Record<VehiclePhase, { label: string; cls: string }>> = {
                  TURNO_ASIGNADO:    { label: 'Turno asig.',    cls: 'text-amber-700 bg-amber-50 border-amber-200' },
                  CONFIRMADO:        { label: 'Confirmado',     cls: 'text-blue-700 bg-blue-50 border-blue-200' },
                  EN_PATIO:          { label: 'En patio',       cls: 'text-violet-700 bg-violet-50 border-violet-200' },
                  EN_PESAJE_INICIAL: { label: 'Pesaje inicial', cls: 'text-orange-700 bg-orange-50 border-orange-200' },
                  EN_BAHIA:          { label: 'En bahía',       cls: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
                  EN_PESAJE_FINAL:   { label: 'Pesaje final',   cls: 'text-orange-700 bg-orange-50 border-orange-200' },
                  ESPERANDO_SALIDA:  { label: 'Esp. salida',    cls: 'text-teal-700 bg-teal-50 border-teal-200' },
                }
                const pill = PHASE_LABELS[v.phase]
                return (
                  <tr key={v.id} className={`border-b border-[#F0F4F8] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C2434] text-white text-xs font-bold">
                        {v.turnNumber}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-[#1C2434]">{v.driverName}</p>
                      <p className="text-xs text-[#9BAEC8] font-mono">{v.vehiclePlate}</p>
                    </td>
                    <td className="px-5 py-3 max-w-[120px]">
                      <p className="truncate text-sm text-[#637381]">{v.clientName}</p>
                    </td>
                    <td className="px-5 py-3">
                      {pill && (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pill.cls}`}>
                          {pill.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {v.waitingMinutes > 0 ? (
                        <span className={`text-sm font-medium tabular-nums ${v.waitingMinutes > 45 ? 'text-red-600 font-bold' : v.waitingMinutes > 30 ? 'text-amber-600' : 'text-[#637381]'}`}>
                          {v.waitingMinutes} min {v.waitingMinutes > 45 ? '⚠' : ''}
                        </span>
                      ) : (
                        <span className="text-sm text-[#9BAEC8]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link to="/drivers" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434]">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {inPlant.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#9BAEC8]">
                    No hay vehículos activos en este momento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({ vehicles }: { vehicles: OperationalVehicle[] }) {
  const { startTour } = useOnboardingTour()
  const inPlant   = vehicles.filter(v => !['PRE_REGISTRO', 'COMPLETADO', 'RECHAZADO'].includes(v.phase)).length
  const overdue   = vehicles.filter(v => v.waitingMinutes > 45).length
  const baysActive = vehicles.filter(v => v.phase === 'EN_BAHIA').length
  const completed = vehicles.filter(v => v.phase === 'COMPLETADO').length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Panel Principal</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Visión de negocio e inventario del terminal</p>
        </div>
        <button
          onClick={startTour}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#E8EDF2] bg-white px-4 py-2.5 text-sm font-semibold text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Guía rápida
        </button>
      </div>

      {/* Operational live strip */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8EDF2]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-[#1C2434]">Ciclo operativo — en vivo</p>
          </div>
          <Link to="/drivers" className="flex items-center gap-1 text-xs font-medium text-[#1E88E5] hover:underline">
            Ver detalle <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#E8EDF2]">
          {[
            { label: 'En planta',      value: inPlant,   color: 'text-[#1E88E5]',   icon: Truck },
            { label: 'Bahías activas', value: baysActive, color: 'text-cyan-600',    icon: Hash },
            { label: 'Completados hoy',value: completed,  color: 'text-emerald-600', icon: CheckCircle2 },
            { label: 'Alertas espera', value: overdue,    color: overdue > 0 ? 'text-red-600 font-bold' : 'text-[#637381]', icon: AlertTriangle },
          ].map(item => (
            <div key={item.label} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <p className="text-xs text-[#9BAEC8]">{item.label}</p>
              </div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Inventario Total"
          value={formatNumber(stats.totalInventory, 0) + ' t'}
          icon={Package}
          iconColor="text-[#1E88E5]"
          iconBg="bg-[#1E88E5]/10"
          trend={stats.inventoryTrend}
          trendLabel="vs ayer"
        />
        <StatCard
          title="Clientes Activos"
          value={stats.activeClients}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={0}
          trendLabel="sin cambios"
        />
        <StatCard
          title="Movimientos Hoy"
          value={stats.todayMovements}
          icon={ArrowLeftRight}
          iconColor="text-[#E65100]"
          iconBg="bg-[#E65100]/10"
          trend={2}
          trendLabel="vs promedio"
        />
        <StatCard
          title="Capacidad Utilizada"
          value={stats.capacityUsed + '%'}
          icon={Gauge}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          footer={
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#637381]">
                <span>Ocupado</span>
                <span className="font-semibold">{stats.capacityUsed}%</span>
              </div>
              <Progress value={stats.capacityUsed} className="h-1.5" />
            </div>
          }
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Area chart */}
        <Card className="rounded-xl border border-[#E8EDF2] shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1C2434]">
                Movimientos — Últimos 30 días
              </CardTitle>
              <Link to="/movements" className="flex items-center gap-1 text-xs font-medium text-[#1E88E5] hover:underline">
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1E88E5" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gSalida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E65100" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#E65100" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9BAEC8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9BAEC8' }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v, 0)} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E8EDF2', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
                    formatter={(v: number, n: string) => [formatNumber(v) + ' t', n === 'entrada' ? 'Entradas' : 'Salidas']}
                  />
                  <Legend formatter={v => <span style={{ fontSize: 12, color: '#637381' }}>{v === 'entrada' ? 'Entradas' : 'Salidas'}</span>} />
                  <Area type="monotone" dataKey="entrada" stroke="#1E88E5" strokeWidth={2} fill="url(#gEntrada)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="salida"  stroke="#E65100" strokeWidth={2} fill="url(#gSalida)"  dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="rounded-xl border border-[#E8EDF2] shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#1C2434]">
              Distribución por Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productDistrib} cx="50%" cy="50%" innerRadius={54} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {productDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-5" fontSize="22" fontWeight="bold" fill="#1C2434">
                      {formatNumber(productDistrib.reduce((s, d) => s + d.value, 0), 0)}
                    </tspan>
                    <tspan x="50%" dy="18" fontSize="11" fill="#637381">toneladas</tspan>
                  </text>
                  <Tooltip formatter={(v: number) => [formatTons(v), 'Toneladas']} contentStyle={{ background: '#fff', border: '1px solid #E8EDF2', borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2.5">
              {productDistrib.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-sm text-[#637381]">{item.name}</span>
                  <span className="text-sm font-semibold text-[#1C2434]">{formatTons(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-11">

        {/* Bar chart */}
        <Card className="rounded-xl border border-[#E8EDF2] shadow-sm lg:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#1C2434]">Saldo por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientBalances} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9BAEC8' }} tickLine={false} axisLine={false} tickFormatter={v => formatNumber(v, 0)} />
                  <YAxis type="category" dataKey="clientName" width={110} tickLine={false} axisLine={false}
                    tick={({ x, y, payload }) => (
                      <text x={x} y={y} dy={4} textAnchor="end" fontSize={10} fill="#637381">
                        {(payload.value as string).length > 14 ? (payload.value as string).slice(0, 13) + '…' : payload.value}
                      </text>
                    )}
                  />
                  <Tooltip formatter={(v: number) => [formatTons(v), 'Balance']} contentStyle={{ background: '#fff', border: '1px solid #E8EDF2', borderRadius: 10 }} />
                  <Bar dataKey="balance" radius={[0, 4, 4, 0]} maxBarSize={12} fill="#1E88E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent movements */}
        <Card className="rounded-xl border border-[#E8EDF2] shadow-sm lg:col-span-5">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1C2434]">Últimos Movimientos</CardTitle>
              <Link to="/movements" className="flex items-center gap-1 text-xs font-medium text-[#1E88E5] hover:underline">
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <Table>
              <TableHeader>
                <TableRow className="border-y border-[#E8EDF2] bg-[#F7F9FC] hover:bg-[#F7F9FC]">
                  <TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wide text-[#637381]">Fecha</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#637381]">Tipo</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#637381]">Cliente</TableHead>
                  <TableHead className="pr-5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#637381]">Ton.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map(m => (
                  <TableRow key={m.id} className="border-b border-[#F0F4F8] hover:bg-[#F7F9FC] transition-colors">
                    <TableCell className="pl-5 py-3 text-xs text-[#637381]">
                      {format(m.date, 'd MMM', { locale: es })}
                    </TableCell>
                    <TableCell className="py-3"><TypeBadge type={m.type} /></TableCell>
                    <TableCell className="py-3 max-w-[90px] truncate text-sm font-medium text-[#1C2434]">
                      {m.clientName.split(' ')[0]}
                    </TableCell>
                    <TableCell className={`pr-5 py-3 text-right text-sm font-semibold ${m.type === 'ENTRADA' ? 'text-emerald-600' : m.type === 'SALIDA' ? 'text-red-600' : 'text-[#637381]'}`}>
                      {m.type === 'ENTRADA' ? '+' : m.type === 'SALIDA' ? '-' : ''}{formatNumber(m.tons, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── router ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const { vehicles } = useOperational()

  if (user?.role === 'OPERATOR') {
    return <OperatorDashboard vehicles={vehicles} />
  }

  return <AdminDashboard vehicles={vehicles} />
}
