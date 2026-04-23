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

export default function InventoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balances, setBalances] = useState(mockInventoryBalances)
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [qualityFilter, setQualityFilter] = useState('all')

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

  // Current balance for selected client/product/quality
  const currentBalance = useMemo(() => {
    if (!watchedClientId || !watchedProductId || !watchedQualityId) return null
    const balance = balances.find(
      b =>
        b.clientId === watchedClientId &&
        b.productId === watchedProductId &&
        b.qualityId === watchedQualityId
    )
    return balance?.balance || 0
  }, [watchedClientId, watchedProductId, watchedQualityId, balances])

  const insufficientBalance =
    watchedType === 'SALIDA' && currentBalance !== null && watchedTons > currentBalance

  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesProduct = productFilter === 'all' || b.productId === productFilter
      const matchesQuality = qualityFilter === 'all' || b.qualityId === qualityFilter
      return matchesSearch && matchesProduct && matchesQuality
    })
  }, [balances, searchTerm, productFilter, qualityFilter])

  const onSubmit = async (data: MovementFormData) => {
    if (insufficientBalance) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    const client = mockClients.find(c => c.id === data.clientId)
    const product = mockProducts.find(p => p.id === data.productId)
    const quality = product?.qualities.find(q => q.id === data.qualityId)

    // Update balance in local state
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
          // AJUSTE: fija el valor absoluto
          newBalance = data.tons
        }
        updated[existingIndex] = { ...updated[existingIndex], balance: newBalance, lastMovementDate: new Date() }
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
    if (balance === 0) {
      return <Badge className="bg-red-100 text-red-700">CRÍTICO</Badge>
    }
    if (balance < 100) {
      return <Badge className="bg-yellow-100 text-yellow-700">BAJO</Badge>
    }
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
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0D2137]">
            Registrar Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Type */}
              <div className="space-y-2">
                <Label>Tipo de Movimiento</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRADA">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-4 w-4 text-[#2E7D32]" />
                            <span>ENTRADA</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SALIDA">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-4 w-4 text-[#C62828]" />
                            <span>SALIDA</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="AJUSTE">
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-[#5C7391]" />
                            <span>AJUSTE (fija saldo)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Client */}
              <div className="space-y-2">
                <Label>Cliente</Label>
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
                  <p className="text-sm text-red-500">{errors.clientId.message}</p>
                )}
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label>Producto</Label>
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
                  <p className="text-sm text-red-500">{errors.productId.message}</p>
                )}
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label>Calidad</Label>
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
                        <SelectValue placeholder="Seleccionar calidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map(quality => (
                          <SelectItem key={quality.id} value={quality.id}>
                            {quality.name} ({quality.description})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.qualityId && (
                  <p className="text-sm text-red-500">{errors.qualityId.message}</p>
                )}
              </div>

              {/* Tons */}
              <div className="space-y-2">
                <Label>Toneladas</Label>
                <Controller
                  name="tons"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      className="h-11"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
                {currentBalance !== null && (
                  <p className="text-sm text-[#1E88E5]">
                    Saldo actual: {formatTons(currentBalance)}
                  </p>
                )}
                {insufficientBalance && (
                  <Alert variant="destructive" className="mt-2 border-red-200 bg-red-50 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Saldo insuficiente. Disponible: {formatTons(currentBalance!)}
                    </AlertDescription>
                  </Alert>
                )}
                {errors.tons && <p className="text-sm text-red-500">{errors.tons.message}</p>}
              </div>

              {/* Notes */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label>
                  Notas / Justificación
                  {watchedType === 'AJUSTE' && <span className="text-red-500"> *</span>}
                </Label>
                <Textarea
                  {...register('notes')}
                  placeholder="Ingrese notas o justificación..."
                  className="h-11 min-h-[44px] resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || insufficientBalance}
              className="w-full bg-[#0D2137] text-white hover:bg-[#1A3A5C] md:w-auto"
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
          </form>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="balances">
        <TabsList className="mb-4">
          <TabsTrigger value="balances">Saldos Actuales</TabsTrigger>
          <TabsTrigger value="audit">Log de Auditoría</TabsTrigger>
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
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="h-9 w-48 pl-9"
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
                        <TableCell>{balance.productName}</TableCell>
                        <TableCell>{balance.qualityName}</TableCell>
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
                      <TableHead className="text-right">Saldo Anterior</TableHead>
                      <TableHead className="text-right">Saldo Nuevo</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovements.slice(0, 20).map(movement => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap text-[#5C7391]">
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
                        <TableCell className="max-w-[120px] truncate">
                          {movement.clientName}
                        </TableCell>
                        <TableCell>{movement.productName}</TableCell>
                        <TableCell>{movement.qualityName}</TableCell>
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
                        <TableCell className="text-right text-[#5C7391]">
                          {formatNumber(movement.previousBalance, 3)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatNumber(movement.newBalance, 3)}
                        </TableCell>
                        <TableCell className="text-[#5C7391]">{movement.userName}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-xs text-[#5C7391]">{movement.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
