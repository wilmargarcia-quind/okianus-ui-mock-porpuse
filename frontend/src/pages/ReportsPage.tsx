import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Clock, Play, FileText, Download, RefreshCw, Mail,
  CheckCircle2, AlertCircle, Send, CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { mockClients, mockReports } from '@/data/mockData'
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

export default function ReportsPage() {
  const [monthFilter,          setMonthFilter]          = useState('2026-04')
  const [statusFilter,         setStatusFilter]         = useState<string>('all')
  const [showConfirmDialog,    setShowConfirmDialog]    = useState(false)
  const [isGenerating,         setIsGenerating]         = useState(false)
  const [sendTime,             setSendTime]             = useState('23:59')
  const [clientEmailSettings,  setClientEmailSettings]  = useState(
    mockClients.reduce((acc, c) => { acc[c.id] = true; return acc }, {} as Record<string, boolean>)
  )

  const filteredReports = mockReports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return format(r.date, 'yyyy-MM') === monthFilter
  })

  const sent    = filteredReports.filter(r => r.status === 'ENVIADO').length
  const pending = filteredReports.filter(r => r.status === 'PENDIENTE').length
  const failed  = filteredReports.filter(r => r.status === 'FALLIDO').length

  const handleGenerateNow = async () => {
    setShowConfirmDialog(false)
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    toast.success('Reporte generado', { description: 'Reportes PDF + Excel enviados a todos los clientes activos.' })
    setIsGenerating(false)
  }

  const handleDownload = (type: 'pdf' | 'excel') => {
    toast.info('Descargando…', { description: `Preparando archivo ${type.toUpperCase()}.` })
  }

  const handleResend = (report: Report) => {
    toast.success('Reporte reenviado', {
      description: `Reenviado el ${format(report.date, 'd MMM yyyy', { locale: es })}.`,
    })
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Reportes Automáticos</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Cierre de día automático con envío por email a cada cliente</p>
        </div>
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1C2434] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors shadow-sm disabled:opacity-60"
        >
          {isGenerating
            ? <><Spinner className="h-4 w-4" /> Generando…</>
            : <><Play className="h-4 w-4" /> Generar ahora</>
          }
        </button>
      </div>

      {/* Scheduler strip */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden border-l-4 border-l-[#1E88E5]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E88E5]/10">
              <Clock className="h-5 w-5 text-[#1E88E5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1C2434]">Cierre automático diario — <span className="text-[#1E88E5]">{sendTime}</span></p>
              <p className="text-xs text-[#637381]">Genera reportes PDF + Excel individuales por cliente y los envía al email registrado.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="sendTime" className="text-xs text-[#9BAEC8] whitespace-nowrap">Hora de envío</Label>
            <Input id="sendTime" type="time" value={sendTime}
              onChange={e => setSendTime(e.target.value)}
              className="h-8 w-28 border-[#E8EDF2] text-sm" />
            <button
              onClick={() => toast.success('Hora actualizada')}
              className="rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] px-3 py-1.5 text-xs font-medium text-[#637381] hover:text-[#1C2434] transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Reportes del mes"  value={filteredReports.length}
          icon={CalendarDays}  iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Enviados"           value={sent}
          icon={Send}          iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Pendientes"         value={pending}
          icon={Clock}         iconColor="text-amber-600"   iconBg="bg-amber-50" />
        <StatCard title="Fallidos"           value={failed}
          icon={AlertCircle}   iconColor={failed > 0 ? 'text-red-600' : 'text-[#9BAEC8]'}
          iconBg={failed > 0 ? 'bg-red-50' : 'bg-[#F7F9FC]'} />
      </div>

      {/* History table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E8EDF2] bg-[#F7F9FC] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Historial de reportes</p>
          <div className="flex items-center gap-2">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-32 border-[#E8EDF2] text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="GENERADO">Generado</SelectItem>
                <SelectItem value="ENVIADO">Enviado</SelectItem>
                <SelectItem value="FALLIDO">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Fecha operativa', 'Estado', 'Clientes', 'PDF', 'Excel', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${i >= 2 ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, i) => (
                <tr key={r.id} className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                  <td className="px-5 py-3 text-sm font-medium text-[#1C2434] whitespace-nowrap">
                    {format(r.date, 'd MMMM yyyy', { locale: es })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-[#F7F9FC] border border-[#E8EDF2] px-2.5 py-0.5 text-xs text-[#637381]">
                      {r.clientsIncluded}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={r.status === 'PENDIENTE'}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                      title="Descargar PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDownload('excel')}
                      disabled={r.status === 'PENDIENTE'}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-30"
                      title="Descargar Excel"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {(r.status === 'ENVIADO' || r.status === 'FALLIDO') && (
                      <button
                        onClick={() => handleResend(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8EDF2] px-3 py-1.5 text-xs font-medium text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" /> Reenviar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No hay reportes para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#E8EDF2] px-5 py-2.5 text-xs text-[#9BAEC8]">
          {filteredReports.length} registros
        </div>
      </div>

      {/* Email config */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[#E8EDF2] bg-[#F7F9FC] px-5 py-3.5">
          <Mail className="h-4 w-4 text-[#9BAEC8]" />
          <p className="text-sm font-semibold text-[#1C2434]">Configuración de envío por cliente</p>
        </div>
        <div className="p-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mockClients.map(client => (
            <div key={client.id}
              className="flex items-center justify-between rounded-xl border border-[#E8EDF2] bg-[#F7F9FC] px-4 py-3">
              <div className="min-w-0 flex-1 mr-3">
                <p className="truncate text-sm font-medium text-[#1C2434]">{client.name}</p>
                <p className="truncate text-xs text-[#9BAEC8]">{client.email}</p>
              </div>
              <Switch
                checked={clientEmailSettings[client.id]}
                onCheckedChange={checked =>
                  setClientEmailSettings(prev => ({ ...prev, [client.id]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="rounded-2xl border-[#E8EDF2] shadow-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1C2434]">Generar reporte ahora</DialogTitle>
            <DialogDescription className="text-sm text-[#637381]">
              Se generarán reportes PDF y Excel para todos los clientes activos con los datos hasta este momento. ¿Continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowConfirmDialog(false)}
              className="rounded-xl border border-[#E8EDF2] px-4 py-2 text-sm font-medium text-[#637381] hover:text-[#1C2434] transition-colors">
              Cancelar
            </button>
            <button onClick={handleGenerateNow}
              className="rounded-xl bg-[#1C2434] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors">
              Generar ahora
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
