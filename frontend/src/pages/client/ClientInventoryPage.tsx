import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  TrendingUp, TrendingDown, Minus,
  ArrowUpRight, ArrowDownRight, BookOpen,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  mockInventoryBalances, mockMovements, formatNumber, formatTons,
  getClientMovementHistory,
} from '@/data/mockData'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'

// ─── Product palette ──────────────────────────────────────────────────────────

const PALETTE = ['#1E88E5', '#E65100', '#2E7D32', '#6A1B9A', '#00838F']

// ─── TypePill ─────────────────────────────────────────────────────────────────

function TypePill({ type }: { type: string }) {
  const cfg: Record<string, string> = {
    ENTRADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SALIDA:  'bg-red-50 text-red-700 border-red-200',
    AJUSTE:  'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg[type] ?? cfg.AJUSTE}`}>
      {type}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientInventoryPage() {
  const { user }        = useAuth()
  const { startTour }   = useOnboardingTour()
  const clientId        = user?.clientId   || 'CLI-001'
  const clientName      = user?.clientName || 'BioEnergía S.A.'

  // ── data derivation ──────────────────────────────────────────────────────────
  const clientBalances  = useMemo(
    () => mockInventoryBalances.filter(b => b.clientId === clientId),
    [clientId],
  )
  const clientMovements = useMemo(
    () => mockMovements.filter(m => m.clientId === clientId).slice(0, 15),
    [clientId],
  )
  const totalBalance = useMemo(
    () => clientBalances.reduce((s, b) => s + b.balance, 0),
    [clientBalances],
  )

  // Week change: sum of net movements in last 7 days
  const weekChange = useMemo(() => {
    const cutoff = new Date('2026-04-16')
    return mockMovements
      .filter(m => m.clientId === clientId && m.date >= cutoff)
      .reduce((s, m) => s + (m.type === 'ENTRADA' ? m.tons : m.type === 'SALIDA' ? -m.tons : 0), 0)
  }, [clientId])

  // Running balance for chart (compute from raw daily deltas)
  const chartData = useMemo(() => {
    const raw = getClientMovementHistory(clientId)
    const totalDelta = raw.reduce((s, d) => s + d.entrada - d.salida + (d.ajuste ?? 0), 0)
    let running = Math.max(0, totalBalance - totalDelta)
    return raw.map(d => {
      running += d.entrada - d.salida + (d.ajuste ?? 0)
      return { date: d.date, balance: Math.max(0, Math.round(running * 10) / 10 ) }
    })
  }, [clientId, totalBalance])

  // Allocation data enriched with colour and %
  const allocations = useMemo(() =>
    clientBalances.map((b, i) => ({
      ...b,
      color:   PALETTE[i % PALETTE.length],
      pct:     totalBalance > 0 ? (b.balance / totalBalance) * 100 : 0,
      lastMov: clientMovements.find(m => m.qualityId === b.qualityId),
    })),
  [clientBalances, totalBalance, clientMovements])

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Mi Inventario</h1>
          <p className="mt-0.5 text-sm text-[#637381]">{clientName} — saldos en tiempo real</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTour}
          className="shrink-0 gap-2 border-[#E8EDF2] text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434]"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Guía rápida
        </Button>
      </div>

      {/* ── Hero: total balance ──────────────────────────────────────────────── */}
      <div
        id="tour-hero"
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1C2434 0%, #2D3A4A 60%, #1E3A5F 100%)' }}
      >
        <div className="px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left: big balance */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
              Saldo total en planta
            </p>
            <p className="text-5xl font-black text-white tabular-nums leading-none">
              {formatTons(totalBalance)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              {weekChange > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  <ArrowUpRight className="h-3 w-3" />
                  +{formatTons(weekChange)} esta semana
                </span>
              ) : weekChange < 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300">
                  <ArrowDownRight className="h-3 w-3" />
                  {formatTons(weekChange)} esta semana
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/60">
                  <Minus className="h-3 w-3" />
                  Sin variación esta semana
                </span>
              )}
            </div>
          </div>

          {/* Right: product breakdown pills */}
          <div className="flex flex-col gap-2 sm:items-end">
            {allocations.map(a => (
              <div key={a.id} className="flex items-center gap-2.5">
                <span className="text-xs text-white/50 text-right">{a.productName} — {a.qualityName}</span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: `${a.color}40`, border: `1px solid ${a.color}60`, color: '#fff' }}
                >
                  {formatNumber(a.balance, 1)} t
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini progress bar per product at the bottom */}
        <div className="flex h-1.5 overflow-hidden">
          {allocations.map(a => (
            <div
              key={a.id}
              className="h-full transition-all"
              style={{ width: `${a.pct}%`, backgroundColor: a.color }}
            />
          ))}
        </div>
      </div>

      {/* ── Allocation cards ─────────────────────────────────────────────────── */}
      <div id="tour-allocations" className={`grid gap-4 ${allocations.length <= 2 ? 'sm:grid-cols-2' : allocations.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
        {allocations.map(a => {
          const trend = a.lastMov?.type === 'ENTRADA' ? 'up' : a.lastMov?.type === 'SALIDA' ? 'down' : 'flat'
          return (
            <div
              key={a.id}
              className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden"
            >
              {/* Color accent top bar */}
              <div className="h-1" style={{ backgroundColor: a.color }} />

              <div className="p-5">
                {/* Product/quality label */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#1C2434]">{a.productName}</p>
                  <p className="text-xs text-[#9BAEC8]">{a.qualityName}</p>
                </div>

                {/* Balance */}
                <p className="text-2xl font-black tabular-nums text-[#1C2434] mb-1">
                  {formatNumber(a.balance, 1)}
                  <span className="text-sm font-medium text-[#9BAEC8] ml-1">t</span>
                </p>

                {/* % share bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#9BAEC8]">% del total</span>
                    <span className="text-[10px] font-semibold text-[#637381]">{a.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#E8EDF2] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${a.pct}%`, backgroundColor: a.color }}
                    />
                  </div>
                </div>

                {/* Trend + last movement date */}
                <div className="flex items-center justify-between border-t border-[#F0F4F8] pt-3">
                  {trend === 'up' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <TrendingUp className="h-3 w-3" /> Entrada reciente
                    </span>
                  ) : trend === 'down' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <TrendingDown className="h-3 w-3" /> Salida reciente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9BAEC8]">
                      <Minus className="h-3 w-3" /> Sin cambios
                    </span>
                  )}
                  <span className="text-[10px] text-[#9BAEC8]">
                    {format(a.lastMovementDate, 'd MMM', { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Evolution chart ──────────────────────────────────────────────────── */}
      <div
        id="tour-chart"
        className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Evolución de inventario — últimos 14 días</p>
          <span className="text-xs text-[#9BAEC8]">toneladas</span>
        </div>
        <div className="p-5 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1E88E5" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9BAEC8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9BAEC8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E8EDF2', borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => [formatTons(v), 'Balance']}
                labelStyle={{ color: '#637381', fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#1E88E5"
                strokeWidth={2.5}
                fill="url(#balanceGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#1E88E5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent movements ─────────────────────────────────────────────────── */}
      <div
        id="tour-movements"
        className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Últimos movimientos</p>
          <span className="text-xs text-[#9BAEC8]">{clientMovements.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Fecha y hora', 'Tipo', 'Producto / Calidad', 'Toneladas', 'Saldo nuevo'].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${idx >= 3 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientMovements.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}
                >
                  <td className="px-5 py-3 text-xs text-[#637381] whitespace-nowrap">
                    {format(m.date, 'd MMM · HH:mm', { locale: es })}
                  </td>
                  <td className="px-5 py-3">
                    <TypePill type={m.type} />
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-[#1C2434]">{m.productName}</p>
                    <p className="text-xs text-[#9BAEC8]">{m.qualityName}</p>
                  </td>
                  <td className={`px-5 py-3 text-right text-sm font-semibold tabular-nums ${
                    m.type === 'ENTRADA' ? 'text-emerald-600' : m.type === 'SALIDA' ? 'text-red-500' : 'text-amber-600'
                  }`}>
                    {m.type === 'ENTRADA' ? '+' : m.type === 'SALIDA' ? '−' : '±'}{formatNumber(Math.abs(m.tons), 1)} t
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium text-[#637381] tabular-nums">
                    {formatNumber(m.newBalance, 1)} t
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
