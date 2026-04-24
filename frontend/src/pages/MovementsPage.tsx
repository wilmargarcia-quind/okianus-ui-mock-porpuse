import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDown, ArrowUp, SlidersHorizontal, Filter, X, TrendingUp } from 'lucide-react'
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
        if (m.type === 'ENTRADA') acc.entradas += m.tons
        else if (m.type === 'SALIDA') acc.salidas += m.tons
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

  const hasFilters =
    dateFrom || dateTo || typeFilter !== 'all' || clientFilter !== 'all' || productFilter !== 'all'

  const getTypeIcon = (type: MovementType) => {
    switch (type) {
      case 'ENTRADA':
        return <ArrowDown className="h-3.5 w-3.5 text-[#2E7D32]" />
      case 'SALIDA':
        return <ArrowUp className="h-3.5 w-3.5 text-[#C62828]" />
      case 'AJUSTE':
        return <SlidersHorizontal className="h-3.5 w-3.5 text-[#5C7391]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Historial de Movimientos</h2>
        <p className="text-[#5C7391]">Consulta y filtra todos los movimientos del terminal</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-[#2E7D32]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C7391]">
              Total Entradas
            </p>
            <p className="mt-1 text-2xl font-bold text-[#2E7D32]">
              {formatNumber(summaryStats.entradas, 3)} t
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#C62828]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C7391]">
              Total Salidas
            </p>
            <p className="mt-1 text-2xl font-bold text-[#C62828]">
              {formatNumber(summaryStats.salidas, 3)} t
            </p>
          </CardContent>
        </Card>
        <Card
          className={`border-l-4 ${summaryStats.balance >= 0 ? 'border-l-[#1E88E5]' : 'border-l-[#C62828]'}`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C7391]">
              Balance Neto
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                summaryStats.balance >= 0 ? 'text-[#1E88E5]' : 'text-[#C62828]'
              }`}
            >
              {summaryStats.balance >= 0 ? '+' : ''}
              {formatNumber(summaryStats.balance, 3)} t
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#5C7391]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C7391]">
              Movimientos
            </p>
            <p className="mt-1 flex items-end gap-2 text-2xl font-bold text-[#0D2137]">
              {summaryStats.count}
              {hasFilters && (
                <span className="mb-0.5 text-xs font-normal text-[#9BAEC8]">filtrados</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#5C7391]" />
              <CardTitle className="text-base">Filtros</CardTitle>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[#5C7391]">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENTRADA">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3.5 w-3.5 text-[#2E7D32]" /> Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="SALIDA">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3.5 w-3.5 text-[#C62828]" /> Salida
                    </div>
                  </SelectItem>
                  <SelectItem value="AJUSTE">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-[#5C7391]" /> Ajuste
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cliente</Label>
              <Select value={clientFilter} onValueChange={v => { setClientFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Producto</Label>
              <Select value={productFilter} onValueChange={v => { setProductFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full-width Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Movimientos</CardTitle>
            <span className="text-sm text-[#5C7391]">
              {paginatedMovements.length} de {filteredMovements.length} registros
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
                  <TableHead className="text-right">Saldo Ant.</TableHead>
                  <TableHead className="text-right">Saldo Nuevo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovements.map(movement => (
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
                        <span className="ml-1 text-xs">{movement.type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[130px] truncate text-sm font-medium text-[#0D2137]">
                      {movement.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-[#5C7391]">
                      {movement.productName.includes('Palma') ? 'Aceite de Palma' : 'GLP'}
                    </TableCell>
                    <TableCell className="text-sm text-[#5C7391]">{movement.qualityName}</TableCell>
                    <TableCell
                      className={`text-right text-sm font-semibold ${
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
                    <TableCell className="text-right text-sm text-[#9BAEC8]">
                      {formatNumber(movement.previousBalance, 3)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-[#0D2137]">
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
    </div>
  )
}
