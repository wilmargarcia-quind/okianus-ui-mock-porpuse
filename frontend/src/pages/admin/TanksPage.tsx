import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Info, Database, Wrench, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatCard } from '@/components/ui/stat-card'
import { Spinner } from '@/components/ui/spinner'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent,
} from '@/components/ui/sheet'
import { mockTanks, formatNumber } from '@/data/mockData'
import type { Tank } from '@/types'

const tankSchema = z.object({
  name:     z.string().min(1, 'El nombre es requerido'),
  capacity: z.number().min(1, 'La capacidad debe ser mayor a 0'),
  status:   z.enum(['active', 'maintenance', 'inactive']),
})

type TankFormData = z.infer<typeof tankSchema>

const STATUS_META: Record<Tank['status'], { label: string; cls: string; dot: string; border: string }> = {
  active:      { label: 'Activo',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', border: 'border-l-emerald-500' },
  maintenance: { label: 'Mantenimiento', cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   border: 'border-l-amber-500'   },
  inactive:    { label: 'Inactivo',      cls: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400',    border: 'border-l-gray-300'    },
}

export default function TanksPage() {
  const [tanks,        setTanks]        = useState(mockTanks)
  const [editingTank,  setEditingTank]  = useState<Tank | null>(null)
  const [isCreating,   setIsCreating]   = useState(false)
  const [showSheet,    setShowSheet]    = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<TankFormData>({ resolver: zodResolver(tankSchema) })

  // ── auto-generate next code ───────────────────────────────────────────────
  function nextCode() {
    const nums = tanks.map(t => parseInt(t.code.replace('TQ-', ''), 10)).filter(n => !isNaN(n))
    const next  = nums.length ? Math.max(...nums) + 1 : 1
    return `TQ-${String(next).padStart(3, '0')}`
  }

  const openCreate = () => {
    setIsCreating(true)
    setEditingTank(null)
    reset({ name: '', capacity: 0, status: 'active' })
    setShowSheet(true)
  }

  const openEdit = (tank: Tank) => {
    setIsCreating(false)
    setEditingTank(tank)
    reset({ name: tank.name, capacity: tank.capacity, status: tank.status })
    setShowSheet(true)
  }

  const onSubmit = async (data: TankFormData) => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))

    if (isCreating) {
      const code = nextCode()
      setTanks(prev => [...prev, { id: code, code, ...data }])
      toast.success(`Tanque ${code} creado`)
    } else if (editingTank) {
      setTanks(prev => prev.map(t => t.id === editingTank.id ? { ...t, ...data } : t))
      toast.success('Tanque actualizado')
    }

    setIsSubmitting(false)
    setShowSheet(false)
  }

  const totalCapacity = tanks.reduce((s, t) => s + t.capacity, 0)
  const activeTanks   = tanks.filter(t => t.status === 'active').length
  const maintTanks    = tanks.filter(t => t.status === 'maintenance').length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Tanques Físicos</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Administra los tanques de almacenamiento del terminal</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1E88E5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1565C0] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nuevo Tanque
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total tanques"    value={tanks.length}
          icon={Database}    iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Capacidad total"  value={`${formatNumber(totalCapacity)} t`}
          icon={Database}    iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Activos"          value={activeTanks}
          icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Mantenimiento"    value={maintTanks}
          icon={Wrench}      iconColor="text-amber-600"   iconBg="bg-amber-50" />
      </div>

      {/* Tank grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tanks.map(tank => {
          const meta = STATUS_META[tank.status]
          return (
            <div
              key={tank.id}
              className={`relative rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden border-l-4 ${meta.border}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-flex rounded-full border border-[#E8EDF2] bg-[#F7F9FC] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#637381] mb-1.5 block w-fit">
                      {tank.code}
                    </span>
                    <p className="text-sm font-bold text-[#1C2434]">{tank.name}</p>
                  </div>
                  <button
                    onClick={() => openEdit(tank)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-t border-[#F0F4F8] pt-3">
                    <span className="text-xs text-[#9BAEC8]">Capacidad</span>
                    <span className="text-lg font-bold tabular-nums text-[#1C2434]">
                      {formatNumber(tank.capacity)} t
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9BAEC8]">Estado</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#1E88E5]/20 bg-[#1E88E5]/5 px-5 py-4">
        <Info className="h-4 w-4 text-[#1E88E5] shrink-0 mt-0.5" />
        <p className="text-sm text-[#637381]">
          El inventario se gestiona por cliente/producto/calidad, no por tanque físico asignado.
          Los tanques son referencia operativa del terminal.
        </p>
      </div>

      {/* ── Sheet (create / edit) ─────────────────────────────────────────────── */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">

          {/* Header */}
          <div className="bg-white border-b border-[#E8EDF2] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2434] text-white shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#1C2434] text-lg leading-tight">
                  {isCreating ? 'Nuevo Tanque' : 'Editar Tanque'}
                </p>
                <p className="text-sm text-[#637381] mt-0.5">
                  {isCreating ? `Se asignará el código ${nextCode()}` : `Modificar datos de ${editingTank?.code}`}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

            {/* Nombre y capacidad */}
            <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
              <div className="px-4 py-3.5">
                <Label htmlFor="name" className="text-xs text-[#9BAEC8] mb-1.5 block">
                  Nombre del tanque <span className="text-red-400">*</span>
                </Label>
                <Input id="name" {...register('name')} placeholder="Ej: Tanque Norte 1"
                  className={`border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5] ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="px-4 py-3.5">
                <Label htmlFor="capacity" className="text-xs text-[#9BAEC8] mb-1.5 block">
                  Capacidad (toneladas) <span className="text-red-400">*</span>
                </Label>
                <Input id="capacity" type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  placeholder="2000"
                  className={`border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5] ${errors.capacity ? 'border-red-400' : ''}`} />
                {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
              </div>
            </div>

            {/* Estado */}
            <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3.5">
                <Label className="text-xs text-[#9BAEC8] mb-1.5 block">Estado</Label>
                <Select value={watch('status')} onValueChange={v => setValue('status', v as Tank['status'])}>
                  <SelectTrigger className="h-10 border-[#E8EDF2]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Activo
                      </span>
                    </SelectItem>
                    <SelectItem value="maintenance">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Mantenimiento
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        Inactivo
                      </span>
                    </SelectItem>
                </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <button type="submit" disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1C2434] py-3 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isCreating ? 'Crear tanque' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setShowSheet(false)}
              className="w-full rounded-xl border border-[#E8EDF2] bg-white py-2.5 text-sm font-medium text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors">
              Cancelar
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
