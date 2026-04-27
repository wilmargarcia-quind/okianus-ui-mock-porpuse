import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText, Download, Clock, Send, CalendarDays, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatCard } from '@/components/ui/stat-card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { getClientDailyReports, formatNumber } from '@/data/mockData'
import type { Report } from '@/types'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Report['status'], { label: string; cls: string; dot: string }> = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-gray-100 text-gray-600 border-gray-200',            dot: 'bg-gray-400' },
  GENERADO:  { label: 'Generado',  cls: 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20',  dot: 'bg-[#1E88E5]' },
  ENVIADO:   { label: 'Enviado',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',     dot: 'bg-emerald-500' },
  FALLIDO:   { label: 'Fallido',   cls: 'bg-red-50 text-red-700 border-red-200',                dot: 'bg-red-500' },
}

function StatusBadge({ status }: { status: Report['status'] }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientReportsPage() {
  const { user }     = useAuth()
  const clientId     = user?.clientId   || 'CLI-001'
  const clientName   = user?.clientName || 'Cliente'
  const [monthFilter, setMonthFilter] = useState('2026-04')

  const clientReports   = useMemo(() => getClientDailyReports(clientId), [clientId])
  const filteredReports = useMemo(
    () => clientReports.filter(r => format(r.date, 'yyyy-MM') === monthFilter),
    [clientReports, monthFilter],
  )

  const sent    = filteredReports.filter(r => r.status === 'ENVIADO').length
  const pending = filteredReports.filter(r => r.status === 'PENDIENTE').length

  // Totals for the period
  const totalEntries = filteredReports.reduce((s, r) => s + (r.entries  ?? 0), 0)
  const totalExits   = filteredReports.reduce((s, r) => s + (r.exits    ?? 0), 0)

  const handleDownload = (type: 'pdf' | 'excel', report: Report) => {
    toast.info('Descargando…', {
      description: `Preparando ${type.toUpperCase()} del ${format(report.date, 'd MMM yyyy', { locale: es })}.`,
    })
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">Mis Reportes</h1>
        <p className="mt-0.5 text-sm text-[#637381]">{clientName} — historial de reportes diarios</p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden border-l-4 border-l-[#1E88E5]">
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E88E5]/10">
            <Clock className="h-5 w-5 text-[#1E88E5]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C2434]">Reportes diarios automáticos — 23:59</p>
            <p className="text-xs text-[#637381]">
              Cada día se genera su reporte individual con el balance del día y se envía a su correo registrado. Puede descargarlo en PDF o Excel.
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Reportes del mes" value={filteredReports.length}
          icon={CalendarDays}  iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Enviados a email" value={sent}
          icon={Send}          iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Entradas del mes" value={`${formatNumber(totalEntries, 0)} t`}
          icon={CheckCircle2}  iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Salidas del mes"  value={`${formatNumber(totalExits, 0)} t`}
          icon={Download}      iconColor="text-[#E65100]"   iconBg="bg-[#E65100]/10" />
      </div>

      {/* Reports table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2] bg-[#F7F9FC] px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-[#1C2434]">Historial de reportes</p>
            <p className="text-xs text-[#9BAEC8]">{filteredReports.length} reportes en el período</p>
          </div>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-8 w-36 border-[#E8EDF2] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-04">Abril 2026</SelectItem>
              <SelectItem value="2026-03">Marzo 2026</SelectItem>
              <SelectItem value="2026-02">Febrero 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {[
                  { h: 'Fecha',             align: 'text-left'  },
                  { h: 'Estado',            align: 'text-left'  },
                  { h: 'Saldo inicial',     align: 'text-right' },
                  { h: 'Entradas',          align: 'text-right' },
                  { h: 'Salidas',           align: 'text-right' },
                  { h: 'Saldo final',       align: 'text-right' },
                  { h: 'PDF',               align: 'text-center'},
                  { h: 'Excel',             align: 'text-center'},
                ].map(({ h, align }) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${align}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, i) => (
                <tr key={r.id} className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                  <td className="px-5 py-3 text-sm font-medium text-[#1C2434] whitespace-nowrap">
                    {format(r.date, 'd MMM yyyy', { locale: es })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums text-[#637381]">
                    {formatNumber(r.initialBalance ?? 0, 1)} t
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums font-semibold text-emerald-600">
                    +{formatNumber(r.entries ?? 0, 1)} t
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums font-semibold text-red-500">
                    −{formatNumber(r.exits ?? 0, 1)} t
                  </td>
                  <td className="px-5 py-3 text-right text-sm tabular-nums font-bold text-[#1C2434]">
                    {formatNumber(r.finalBalance ?? 0, 1)} t
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDownload('pdf', r)}
                      disabled={r.status === 'PENDIENTE'}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                      title="Descargar PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDownload('excel', r)}
                      disabled={r.status === 'PENDIENTE'}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-30"
                      title="Descargar Excel"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay reportes para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#E8EDF2] px-5 py-2.5 text-xs text-[#9BAEC8]">
          {filteredReports.length} registros · {pending} pendiente{pending !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
