import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Percent, Pencil, Hash, Clock, Droplets, Flame, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StatCard } from '@/components/ui/stat-card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { mockParticipation } from '@/data/mockData'
import type { ParticipationConfig } from '@/types'

// ─── schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  percentage:   z.number().min(1).max(100),
  totalBays:    z.number().min(1).max(20),
  assignedBays: z.number().min(0).max(20),
  slaHours:     z.number().min(1).max(48),
  productType:  z.enum(['ACEITE', 'GLP', 'TODOS']),
  active:       z.boolean(),
})
type FormValues = z.infer<typeof schema>

// ─── palette ─────────────────────────────────────────────────────────────────

const COLORS = ['#1E88E5', '#2E7D32', '#E65100', '#C62828', '#6A1B9A', '#F57F17', '#00838F']

// ─── participation bar ────────────────────────────────────────────────────────

function ParticipationBar({ configs }: { configs: ParticipationConfig[] }) {
  const active = configs.filter(c => c.active)
  const total  = active.reduce((s, c) => s + c.percentage, 0)

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#E8EDF2] gap-0.5">
        {active.map((c, i) => (
          <div
            key={c.id}
            style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
            title={`${c.clientName}: ${c.percentage}%`}
            className="first:rounded-l-full last:rounded-r-full transition-all"
          />
        ))}
        {total < 100 && (
          <div
            style={{ width: `${100 - total}%` }}
            className="bg-[#E8EDF2] last:rounded-r-full"
            title={`Sin asignar: ${100 - total}%`}
          />
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {active.map((c, i) => (
          <div key={c.id} className="flex items-center gap-1.5 text-xs text-[#637381]">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="font-medium text-[#1C2434]">{c.clientName}</span>
            <span className="text-[#9BAEC8]">{c.percentage}%</span>
          </div>
        ))}
        {total < 100 && (
          <div className="flex items-center gap-1.5 text-xs text-[#9BAEC8]">
            <span className="h-2 w-2 rounded-full bg-[#E8EDF2] shrink-0" />
            Sin asignar: {100 - total}%
          </div>
        )}
      </div>
    </div>
  )
}

// ─── product section ──────────────────────────────────────────────────────────

function ProductSection({
  title, icon: Icon, iconColor, iconBg, configs, onEdit,
}: {
  title: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  configs: ParticipationConfig[]
  onEdit: (c: ParticipationConfig) => void
}) {
  const totalPct    = configs.filter(c => c.active).reduce((s, c) => s + c.percentage, 0)
  const totalBays   = configs.reduce((s, c) => s + c.assignedBays, 0)

  return (
    <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-[#E8EDF2] bg-[#F7F9FC] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <p className="text-sm font-semibold text-[#1C2434]">{title}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#9BAEC8]">
          <span>Participación asignada: <strong className={`font-semibold ${totalPct > 100 ? 'text-red-600' : totalPct === 100 ? 'text-emerald-600' : 'text-[#637381]'}`}>{totalPct}%</strong></span>
          <span>Bahías: <strong className="font-semibold text-[#637381]">{totalBays}</strong></span>
        </div>
      </div>

      {/* Bar */}
      <div className="px-5 py-4 border-b border-[#F0F4F8]">
        <ParticipationBar configs={configs} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
              {['Cliente', '% Participación', 'Bahías asignadas', 'SLA (h)', 'Estado', ''].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap ${i >= 1 && i <= 3 ? 'text-right' : i === 4 ? 'text-center' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map((c, i) => (
              <tr key={c.id} className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                {/* Client */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {c.clientName[0]}
                    </div>
                    <span className="text-sm font-medium text-[#1C2434]">{c.clientName}</span>
                  </div>
                </td>
                {/* % */}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex flex-col items-end gap-0.5">
                    <span className="text-lg font-bold tabular-nums text-[#1C2434]">{c.percentage}%</span>
                    <div className="h-1 w-16 rounded-full bg-[#E8EDF2] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </td>
                {/* Bays */}
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C2434]">
                    <Hash className="h-3 w-3 text-[#9BAEC8]" />
                    {c.assignedBays} <span className="text-xs font-normal text-[#9BAEC8]">/ {c.totalBays}</span>
                  </span>
                </td>
                {/* SLA */}
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C2434]">
                    <Clock className="h-3 w-3 text-[#9BAEC8]" />
                    {c.slaHours}h
                  </span>
                </td>
                {/* Status */}
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    c.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {/* Edit */}
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onEdit(c)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ParticipationPage() {
  const [configs,      setConfigs]      = useState(mockParticipation)
  const [editing,      setEditing]      = useState<ParticipationConfig | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const aceite = configs.filter(p => p.productType === 'ACEITE')
  const glp    = configs.filter(p => p.productType === 'GLP')

  const totalClients = new Set(configs.map(c => c.clientId)).size
  const totalBays    = configs.reduce((s, c) => s + c.assignedBays, 0)
  const avgSla       = Math.round(configs.reduce((s, c) => s + c.slaHours, 0) / configs.length)

  function openEdit(config: ParticipationConfig) {
    setEditing(config)
    reset({
      percentage:   config.percentage,
      totalBays:    config.totalBays,
      assignedBays: config.assignedBays,
      slaHours:     config.slaHours,
      productType:  config.productType,
      active:       config.active,
    })
  }

  async function onSubmit(data: FormValues) {
    if (!editing) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    setConfigs(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c))
    toast.success('Configuración actualizada', {
      description: `${editing.clientName} — ${data.percentage}% participación`,
    })
    setIsSubmitting(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2434]">% Participación</h1>
        <p className="mt-0.5 text-sm text-[#637381]">
          Porcentaje de participación, bahías asignadas y SLA por cliente y producto
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Clientes configurados" value={totalClients}
          icon={Percent}  iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Bahías asignadas"       value={totalBays}
          icon={Hash}     iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="SLA promedio"           value={`${avgSla} h`}
          icon={Clock}    iconColor="text-amber-600"   iconBg="bg-amber-50" />
        <StatCard title="Productos activos"      value={2}
          icon={Droplets} iconColor="text-violet-600"  iconBg="bg-violet-50" />
      </div>

      {/* Aceite de Palma */}
      <ProductSection
        title="Aceite de Palma"
        icon={Droplets}
        iconColor="text-[#1E88E5]"
        iconBg="bg-[#1E88E5]/10"
        configs={aceite}
        onEdit={openEdit}
      />

      {/* GLP */}
      <ProductSection
        title="GLP — Gas Licuado de Petróleo"
        icon={Flame}
        iconColor="text-[#E65100]"
        iconBg="bg-[#E65100]/10"
        configs={glp}
        onEdit={openEdit}
      />

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#1E88E5]/20 bg-[#1E88E5]/5 px-5 py-4">
        <Info className="h-4 w-4 text-[#1E88E5] shrink-0 mt-0.5" />
        <p className="text-sm text-[#637381]">
          El porcentaje de participación determina la prioridad de atención en el sistema de turnos. La suma de todos los clientes activos por producto debería ser 100%.
        </p>
      </div>

      {/* ── Edit Sheet ─────────────────────────────────────────────────────── */}
      <Sheet open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">
          {editing && (
            <>
              {/* Header */}
              <div className="bg-white border-b border-[#E8EDF2] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2434] text-white shrink-0">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1C2434] text-lg leading-tight">Editar participación</p>
                    <p className="text-sm text-[#637381] mt-0.5">{editing.clientName}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

                {/* Producto */}
                <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5">
                    <Label className="text-xs text-[#9BAEC8] mb-1.5 block">Tipo de producto</Label>
                    <Controller
                      name="productType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-[#E8EDF2]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACEITE">Aceite de Palma</SelectItem>
                            <SelectItem value="GLP">GLP</SelectItem>
                            <SelectItem value="TODOS">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Configuración numérica */}
                <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-[#E8EDF2]">
                    <div className="px-4 py-3.5">
                      <Label htmlFor="percentage" className="text-xs text-[#9BAEC8] mb-1.5 block">
                        Participación (%) <span className="text-red-400">*</span>
                      </Label>
                      <Input id="percentage" type="number" min={1} max={100}
                        {...register('percentage', { valueAsNumber: true })}
                        className="h-10 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
                      {errors.percentage && <p className="mt-1 text-xs text-red-500">{errors.percentage.message}</p>}
                    </div>
                    <div className="px-4 py-3.5">
                      <Label htmlFor="slaHours" className="text-xs text-[#9BAEC8] mb-1.5 block">
                        SLA (horas) <span className="text-red-400">*</span>
                      </Label>
                      <Input id="slaHours" type="number" min={1} max={48}
                        {...register('slaHours', { valueAsNumber: true })}
                        className="h-10 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-[#E8EDF2]">
                    <div className="px-4 py-3.5">
                      <Label htmlFor="totalBays" className="text-xs text-[#9BAEC8] mb-1.5 block">Total bahías</Label>
                      <Input id="totalBays" type="number" min={1} max={20}
                        {...register('totalBays', { valueAsNumber: true })}
                        className="h-10 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
                    </div>
                    <div className="px-4 py-3.5">
                      <Label htmlFor="assignedBays" className="text-xs text-[#9BAEC8] mb-1.5 block">Bahías asignadas</Label>
                      <Input id="assignedBays" type="number" min={0} max={20}
                        {...register('assignedBays', { valueAsNumber: true })}
                        className="h-10 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
                    </div>
                  </div>
                </div>

                {/* Estado activo */}
                <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-[#1C2434]">Configuración activa</p>
                      <p className="text-xs text-[#9BAEC8] mt-0.5">Desactiva para excluir del sistema de turnos</p>
                    </div>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                </div>

                {/* Actions */}
                <button type="submit" disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#1C2434] py-3 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <Spinner className="h-4 w-4" />}
                  Guardar cambios
                </button>
                <button type="button" onClick={() => setEditing(null)}
                  className="w-full rounded-xl border border-[#E8EDF2] bg-white py-2.5 text-sm font-medium text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors">
                  Cancelar
                </button>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
