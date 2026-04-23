import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDown, ArrowUp, SlidersHorizontal, Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { mockClients, mockProducts, mockMovements, formatNumber } from '@/data/mockData'
import type { MovementType } from '@/types'

const ITEMS_PER_PAGE = 20

export default function MovementsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredMovements = useMemo(() => {
    return mockMovements.filter(movement => {
      if (dateFrom) {
        const from = new Date(dateFrom)
        if (movement.date < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59)
        if (movement.date > to) return false
      }
      if (typeFilter !== 'all' && movement.type !== typeFilter) return false
      if (clientFilter !== 'all' && movement.clientId !== clientFilter) return false
      if (productFilter !== 'all' && movement.productId !== productFilter) return false
      return true
    })
  }, [dateFrom, dateTo, typeFilter, clientFilter, productFilter])

  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMovements.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMovements, currentPage])

  const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE)

  const summaryStats = useMemo(() => {
    const totals = filteredMovements.reduce(
      (acc, m) => {
        if (m.type === 'ENTRADA') {
          acc.entradas += m.tons
        } else if (m.type === 'SALIDA') {
          acc.salidas += m.tons
        }
        return acc
      },
      { entradas: 0, salidas: 0 }
    )
    return {
      ...totals,
      balance: totals.entradas - totals.salidas,
      count: filteredMovements.length,
    }
  }, [filteredMovements])

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setTypeFilter('all')
    setClientFilter('all')
    setProductFilter('all')
    setCurrentPage(1)
  }

  const hasFilters = dateFrom || dateTo || typeFilter !== 'all' || clientFilter !== 'all' || productFilter !== 'all'

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Historial de Movimientos</h2>
        <p className="text-[#5C7391]">Consulta y filtra todos los movimientos del terminal</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#5C7391]" />
            <CardTitle className="text-lg">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="h-10">
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Movimientos</CardTitle>
              <span className="text-sm text-[#5C7391]">
                Mostrando {paginatedMovements.length} de {filteredMovements.length} movimientos
              </span>
            </div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMovements.map(movement => (
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
                      <TableCell className="max-w-[120px] truncate font-medium">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="px-4 text-sm text-[#5C7391]">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-[#5C7391]">Total Entradas</p>
              <p className="text-2xl font-bold text-[#2E7D32]">
                {formatNumber(summaryStats.entradas, 3)} t
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[#5C7391]">Total Salidas</p>
              <p className="text-2xl font-bold text-[#C62828]">
                {formatNumber(summaryStats.salidas, 3)} t
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-[#5C7391]">Balance Neto</p>
              <p
                className={`text-2xl font-bold ${
                  summaryStats.balance >= 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'
                }`}
              >
                {summaryStats.balance >= 0 ? '+' : ''}
                {formatNumber(summaryStats.balance, 3)} t
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-[#5C7391]">Movimientos</p>
              <p className="text-2xl font-bold text-[#0D2137]">{summaryStats.count}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
