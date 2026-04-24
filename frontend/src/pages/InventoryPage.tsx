import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  Download,
  Search,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import {
  mockClients,
  mockProducts,
  mockInventoryBalances,
  mockMovements,
  formatNumber,
  formatTons,
} from '@/data/mockData'
import { ComingSoon } from '@/components/ui/coming-soon'
import type { MovementType } from '@/types'

const movementSchema = z.object({
  type: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']),
  clientId: z.string().min(1, 'Selecciona un cliente'),
  productId: z.string().min(1, 'Selecciona un producto'),
  qualityId: z.string().min(1, 'Selecciona una calidad'),
  tons: z.number().min(0.001, 'Debe ser mayor a 0'),
  notes: z.string().optional(),
})

type MovementFormData = z.infer<typeof movementSchema>

const TYPE_OPTIONS = [
  {
    value: 'ENTRADA' as const,
    label: 'Entrada',
    icon: ArrowDown,
    color: '#2E7D32',
    bg: '#F1F8F1',
    border: '#4CAF50',
    desc: 'Ingreso de producto',
  },
  {
    value: 'SALIDA' as const,
    label: 'Salida',
    icon: ArrowUp,
    color: '#C62828',
    bg: '#FFF5F5',
    border: '#EF5350',
    desc: 'Despacho de producto',
  },
  {
    value: 'AJUSTE' as const,
    label: 'Ajuste',
    icon: SlidersHorizontal,
    color: '#5C7391',
    bg: '#F5F7FA',
    border: '#90A4BE',
    desc: 'Fija saldo absoluto',
  },
]

export default function InventoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balances, setBalances] = useState(mockInventoryBalances)
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState('all')

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'ENTRADA',
      clientId: '',
      productId: '',
      qualityId: '',
      tons: 0,
      notes: '',
    },
  })

  const watchedType = watch('type')
  const watchedClientId = watch('clientId')
  const watchedProductId = watch('productId')
  const watchedQualityId = watch('qualityId')
  const watchedTons = watch('tons')

  const selectedProduct = mockProducts.find(p => p.id === watchedProductId)
  const qualities = selectedProduct?.qualities || []

  const currentBalance = useMemo(() => {
    if (!watchedClientId || !watchedProductId || !watchedQualityId) return null
    const balance = balances.find(
      b =>
        b.clientId === watchedClientId &&
        b.productId === watchedProductId &&
        b.qualityId === watchedQualityId
    )
    return balance?.balance ?? 0
  }, [watchedClientId, watchedProductId, watchedQualityId, balances])

  const previewBalance = useMemo(() => {
    if (currentBalance === null || !watchedTons || watchedTons <= 0) return null
    if (watchedType === 'ENTRADA') return currentBalance + watchedTons
    if (watchedType === 'SALIDA') return currentBalance - watchedTons
    return watchedTons // AJUSTE sets absolute
  }, [currentBalance, watchedTons, watchedType])

  const insufficientBalance =
    watchedType === 'SALIDA' && currentBalance !== null && watchedTons > currentBalance

  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const matchesSearch =
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.productName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesProduct = productFilter === 'all' || b.productId === productFilter
      return matchesSearch && matchesProduct
    })
  }, [balances, searchTerm, productFilter])

  const onSubmit = async (data: MovementFormData) => {
    if (insufficientBalance) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    const client = mockClients.find(c => c.id === data.clientId)

    setBalances(prev => {
      const existingIndex = prev.findIndex(
        b =>
          b.clientId === data.clientId &&
          b.productId === data.productId &&
          b.qualityId === data.qualityId
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        let newBalance: number
        if (data.type === 'ENTRADA') {
          newBalance = updated[existingIndex].balance + data.tons
        } else if (data.type === 'SALIDA') {
          newBalance = Math.max(0, updated[existingIndex].balance - data.tons)
        } else {
          newBalance = data.tons
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          balance: newBalance,
          lastMovementDate: new Date(),
        }
        return updated
      }
      return prev
    })

    toast.success('Movimiento registrado correctamente', {
      description: `${data.type} de ${formatTons(data.tons)} para ${client?.name}`,
    })

    reset()
    setIsSubmitting(false)
  }

  const getTypeIcon = (type: MovementType) => {
    switch (type) {
      case 'ENTRADA':
        return <ArrowDown className="h-4 w-4 text-[#2E7D32]" />
      case 'SALIDA':
        return <ArrowUp className="h-4 w-4 text-[#C62828]" />
      case 'AJUSTE':
        return <SlidersHorizontal className="h-4 w-4 text-[#5C7391]" />
    }
  }

  const getStatusBadge = (balance: number) => {
    if (balance === 0)
      return <Badge className="bg-red-100 text-red-700">CRÍTICO</Badge>
    if (balance < 100)
      return <Badge className="bg-yellow-100 text-yellow-700">BAJO</Badge>
    return <Badge className="bg-green-100 text-green-700">OK</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Gestión de Inventario</h2>
        <p className="text-[#5C7391]">
          Motor M1 · El sistema impide saldos negativos a nivel de base de datos
        </p>
      </div>

      {/* Register Movement Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-[#0D2137]">
            Registrar Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Type Selector — visual card buttons */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Tipo de Movimiento</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-3">
                    {TYPE_OPTIONS.map(opt => {
                      const selected = field.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-150 ${
                            selected
                              ? 'shadow-sm'
                              : 'border-border bg-background hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                          style={
                            selected
                              ? { borderColor: opt.border, backgroundColor: opt.bg }
                              : {}
                          }
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: opt.color + '18' }}
                          >
                            <opt.icon className="h-5 w-5" style={{ color: opt.color }} />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: opt.color }}>
                            {opt.label}
                          </span>
                          <span className="text-center text-[11px] leading-tight text-[#9BAEC8]">
                            {opt.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>

            {/* Rest of form fields */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Client */}
              <div className="space-y-2">
                <Label>Cliente <span className="text-red-500">*</span></Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.clientId && (
                  <p className="text-xs text-red-500">{errors.clientId.message}</p>
                )}
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label>Producto <span className="text-red-500">*</span></Label>
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productId && (
                  <p className="text-xs text-red-500">{errors.productId.message}</p>
                )}
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label>Calidad <span className="text-red-500">*</span></Label>
                <Controller
                  name="qualityId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedProductId}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder={watchedProductId ? 'Seleccionar calidad' : 'Primero selecciona producto'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map(quality => (
                          <SelectItem key={quality.id} value={quality.id}>
                            {quality.name}
                            {quality.description && (
                              <span className="ml-1 text-[#9BAEC8]">({quality.description})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.qualityId && (
                  <p className="text-xs text-red-500">{errors.qualityId.message}</p>
                )}
              </div>

              {/* Tons */}
              <div className="space-y-2">
                <Label>Toneladas <span className="text-red-500">*</span></Label>
                <Controller
                  name="tons"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      className="h-11 font-mono"
                      placeholder="0.000"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
                {/* Balance preview */}
                {currentBalance !== null && watchedTons > 0 && !insufficientBalance && (
                  <div className="flex items-center gap-2 rounded-lg border border-[#1E88E5]/20 bg-[#1E88E5]/5 px-3 py-2 text-sm">
                    <span className="text-[#5C7391]">Saldo:</span>
                    <span className="font-medium text-[#0D2137]">{formatTons(currentBalance)}</span>
                    <span className="text-[#9BAEC8]">→</span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          watchedType === 'ENTRADA'
                            ? '#2E7D32'
                            : watchedType === 'SALIDA'
                            ? '#C62828'
                            : '#5C7391',
                      }}
                    >
                      {formatTons(previewBalance!)}
                    </span>
                  </div>
                )}
                {currentBalance !== null && watchedTons === 0 && (
                  <p className="text-xs text-[#1E88E5]">
                    Saldo actual: <span className="font-semibold">{formatTons(currentBalance)}</span>
                  </p>
                )}
                {insufficientBalance && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Saldo insuficiente. Disponible: {formatTons(currentBalance!)}
                    </AlertDescription>
                  </Alert>
                )}
                {errors.tons && <p className="text-xs text-red-500">{errors.tons.message}</p>}
              </div>

              {/* Notes */}
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Notas / Justificación
                  {watchedType === 'AJUSTE' && <span className="text-red-500"> *</span>}
                </Label>
                <Textarea
                  {...register('notes')}
                  placeholder={
                    watchedType === 'AJUSTE'
                      ? 'Justificación obligatoria para ajuste (ej: dictamen laboratorio #LAB-2026-041)…'
                      : 'Observaciones opcionales sobre el movimiento…'
                  }
                  className="min-h-[44px] resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || insufficientBalance}
                className="bg-[#0D2137] text-white hover:bg-[#1A3A5C] px-8"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Movimiento'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                className="text-[#5C7391]"
              >
                Limpiar formulario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="balances">
        <TabsList className="mb-4">
          <TabsTrigger value="balances">Saldos Actuales</TabsTrigger>
          <TabsTrigger value="audit">Log de Auditoría</TabsTrigger>
          <TabsTrigger value="prestamo">Préstamo de Espacio</TabsTrigger>
        </TabsList>

        {/* Balances Tab */}
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">Saldos Actuales</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9BAEC8]" />
                    <Input
                      placeholder="Buscar cliente o producto..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="h-9 w-52 pl-9"
                    />
                  </div>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue placeholder="Producto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los productos</SelectItem>
                      {mockProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ComingSoon label="Exportar Excel — Próximamente">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </Button>
                  </ComingSoon>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Calidad</TableHead>
                      <TableHead className="text-right">Saldo (t)</TableHead>
                      <TableHead>Último Movimiento</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBalances.map(balance => (
                      <TableRow key={balance.id}>
                        <TableCell className="font-medium text-[#0D2137]">
                          {balance.clientName}
                        </TableCell>
                        <TableCell className="text-[#5C7391]">{balance.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {balance.qualityName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#0D2137]">
                          {formatNumber(balance.balance, 3)}
                        </TableCell>
                        <TableCell className="text-[#5C7391]">
                          {format(balance.lastMovementDate, 'd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>{getStatusBadge(balance.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Log de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Calidad</TableHead>
                      <TableHead className="text-right">Toneladas</TableHead>
                      <TableHead className="text-right">Saldo Ant.</TableHead>
                      <TableHead className="text-right">Saldo Nuevo</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovements.slice(0, 20).map(movement => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap text-sm text-[#5C7391]">
                          {format(movement.date, 'd MMM yyyy · HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              movement.type === 'ENTRADA'
                                ? 'bg-green-100 text-green-700'
                                : movement.type === 'SALIDA'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {getTypeIcon(movement.type)}
                            <span className="ml-1">{movement.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[110px] truncate text-sm">
                          {movement.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-[#5C7391]">
                          {movement.productName.includes('Palma') ? 'Aceite de Palma' : 'GLP'}
                        </TableCell>
                        <TableCell className="text-sm text-[#5C7391]">
                          {movement.qualityName}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            movement.type === 'ENTRADA'
                              ? 'text-[#2E7D32]'
                              : movement.type === 'SALIDA'
                              ? 'text-[#C62828]'
                              : 'text-[#5C7391]'
                          }`}
                        >
                          {movement.type === 'ENTRADA' ? '+' : movement.type === 'SALIDA' ? '-' : ''}
                          {formatNumber(movement.tons, 3)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-[#5C7391]">
                          {formatNumber(movement.previousBalance, 3)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatNumber(movement.newBalance, 3)}
                        </TableCell>
                        <TableCell className="text-sm text-[#5C7391]">{movement.userName}</TableCell>
                        <TableCell className="max-w-[160px] truncate text-xs text-[#9BAEC8]">
                          {movement.notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préstamo de Espacio Tab (Should Have MoSCoW) */}
        <TabsContent value="prestamo">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registrar Préstamo de Espacio</CardTitle>
                <p className="text-sm text-[#5C7391]">
                  Permite que un cliente use temporalmente el cupo asignado a otro cliente.
                  Requiere aprobación administrativa y genera trazabilidad completa.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cliente Prestamista (cede espacio)</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cliente Prestatario (recibe espacio)</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Producto</Label>
                      <Select>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Toneladas a prestar</Label>
                      <Input type="number" step="0.001" min="0" className="h-11 font-mono" placeholder="0.000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha inicio</Label>
                      <Input type="date" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha fin estimada</Label>
                      <Input type="date" className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Justificación / Contrato <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Número de contrato, autorización o justificación del préstamo…"
                      rows={3}
                    />
                  </div>
                  <ComingSoon label="Registro de préstamos — Próximamente disponible en producción">
                    <Button className="w-full bg-[#0D2137] hover:bg-[#1A3A5C]">
                      Registrar Préstamo
                    </Button>
                  </ComingSoon>
                </div>
              </CardContent>
            </Card>

            {/* Info + empty state */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Préstamos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E88E5]/10">
                      <ArrowLeftRight className="h-8 w-8 text-[#1E88E5]" />
                    </div>
                    <p className="font-semibold text-[#0D2137]">Sin préstamos activos</p>
                    <p className="mt-1 text-sm text-[#5C7391]">
                      Los préstamos de espacio registrados aparecerán aquí con su estado, vencimiento
                      y seguimiento.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/60">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-amber-800">¿Qué es un préstamo de espacio?</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Un cliente cede temporalmente su cupo de almacenamiento a otro. El sistema
                    registra la operación, mantiene el aislamiento contable entre clientes y genera
                    trazabilidad completa para auditoría — requisito clave del motor de inventario M1.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
