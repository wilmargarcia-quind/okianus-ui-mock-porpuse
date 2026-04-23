import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Info, Database } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { mockTanks, formatNumber } from '@/data/mockData'
import type { Tank } from '@/types'

const tankSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  capacity: z.number().min(1, 'La capacidad debe ser mayor a 0'),
  status: z.enum(['active', 'maintenance', 'inactive']),
})

type TankFormData = z.infer<typeof tankSchema>

export default function TanksPage() {
  const [tanks, setTanks] = useState(mockTanks)
  const [editingTank, setEditingTank] = useState<Tank | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TankFormData>({
    resolver: zodResolver(tankSchema),
  })

  const openEditDialog = (tank: Tank) => {
    setEditingTank(tank)
    reset({
      name: tank.name,
      capacity: tank.capacity,
      status: tank.status,
    })
    setShowDialog(true)
  }

  const onSubmit = async (data: TankFormData) => {
    if (!editingTank) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setTanks(prev =>
      prev.map(t =>
        t.id === editingTank.id
          ? { ...t, name: data.name, capacity: data.capacity, status: data.status }
          : t
      )
    )

    toast.success('Tanque actualizado exitosamente')
    setIsSubmitting(false)
    setShowDialog(false)
  }

  const getStatusBadge = (status: Tank['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Activo</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-700">Mantenimiento</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">Inactivo</Badge>
    }
  }

  const totalCapacity = tanks.reduce((acc, t) => acc + t.capacity, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Tanques Físicos</h2>
        <p className="text-[#5C7391]">Administra los tanques de almacenamiento del terminal</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5]/10">
                <Database className="h-6 w-6 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-sm text-[#5C7391]">Total Tanques</p>
                <p className="text-2xl font-bold text-[#0D2137]">{tanks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E7D32]/10">
                <Database className="h-6 w-6 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-sm text-[#5C7391]">Capacidad Total</p>
                <p className="text-2xl font-bold text-[#0D2137]">{formatNumber(totalCapacity)} t</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E65100]/10">
                <Database className="h-6 w-6 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm text-[#5C7391]">En Mantenimiento</p>
                <p className="text-2xl font-bold text-[#0D2137]">
                  {tanks.filter(t => t.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tanks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tanks.map(tank => (
          <Card key={tank.id} className="relative overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                tank.status === 'active'
                  ? 'bg-[#2E7D32]'
                  : tank.status === 'maintenance'
                  ? 'bg-[#E65100]'
                  : 'bg-gray-400'
              }`}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 font-mono">
                    {tank.code}
                  </Badge>
                  <CardTitle className="text-lg">{tank.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(tank)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4 text-[#5C7391]" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5C7391]">Capacidad</span>
                  <span className="text-lg font-bold text-[#0D2137]">
                    {formatNumber(tank.capacity)} t
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#5C7391]">Estado</span>
                  {getStatusBadge(tank.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Note */}
      <Alert className="border-[#1E88E5]/30 bg-[#1E88E5]/5">
        <Info className="h-4 w-4 text-[#1E88E5]" />
        <AlertDescription className="text-[#5C7391]">
          El inventario se gestiona por cliente/producto/calidad, no por tanque físico asignado. Los
          tanques son referencia operativa del terminal.
        </AlertDescription>
      </Alert>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tanque</DialogTitle>
            <DialogDescription>
              Modifica los datos del tanque {editingTank?.code}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del tanque *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Tanque Norte 1"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad (toneladas) *</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="2000"
              />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={watch('status')}
                onValueChange={value => setValue('status', value as Tank['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
