import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowDown, ArrowUp, SlidersHorizontal, Filter, X,
  Download, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { mockClients, mockProducts, mockMovements, formatNumber } from '@/data/mockData'
import type { MovementType } from '@/types'

const ITEMS_PER_PAGE = 15

// ─── helpers ──────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: MovementType }) {
  const cfg = {
    ENTRADA: { label: 'Entrada', icon: <ArrowDown className="h-3 w-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    SALIDA:  { label: 'Salida',  icon: <ArrowUp   className="h-3 w-3" />, cls: 'bg-red-50    text-red-700    border-red-100'    },
    AJUSTE:  { label: 'Ajuste',  icon: <SlidersHorizontal className="h-3 w-3" />, cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  }[type]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

function PageButton({ page, current, onClick }: { page: number; current: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
        page === current
          ? 'bg-[#1E88E5] text-white shadow-sm'
          : 'text-[#637381] hover:bg-[#F0F4F8] hover:text-[#1C2434]'
      }`}
    >
      {page}
    </button>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function MovementsPage() {
  const [dateFrom,      setDateFrom]      = useState('')
  const [dateTo,        setDateTo]        = useState('')
  const [typeFilter,    setTypeFilter]    = useState<string>('all')
  const [clientFilter,  setClientFilter]  = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [currentPage,   setCurrentPage]   = useState(1)

  const filtered = useMemo(() => mockMovements.filter(m => {
    if (dateFrom && m.date < new Date(dateFrom)) return false
    if (dateTo) { const to = new Date(dateTo); to.setHours(23,59,59); if (m.date > to) return false }
    if (typeFilter    !== 'all' && m.type      !== typeFilter)    return false
    if (clientFilter  !== 'all' && m.clientId  !== clientFilter)  return false
    if (productFilter !== 'all' && m.productId !== productFilter) return false
    return true
  }), [dateFrom, dateTo, typeFilter, clientFilter, productFilter])

  const paginated  = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage])
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const summary = useMemo(() => filtered.reduce((a, m) => {
    if (m.type === 'ENTRADA') a.entradas += m.tons
    else if (m.type === 'SALIDA') a.salidas += m.tons
    return a
  }, { entradas: 0, salidas: 0 }), [filtered])

  const hasFilters = dateFrom || dateTo || typeFilter !== 'all' || clientFilter !== 'all' || productFilter !== 'all'

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setTypeFilter('all')
    setClientFilter('all'); setProductFilter('all'); setCurrentPage(1)
  }

  // build page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 4) return [1,2,3,4,5,'…',totalPages]
    if (currentPage >= totalPages - 3) return [1,'…',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages]
    return [1,'…',currentPage-1,currentPage,currentPage+1,'…',totalPages]
  }, [totalPages, currentPage])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Historial de Movimientos</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Consulta y filtra todos los movimientos del terminal</p>
        </div>
        <Button variant="outline" className="gap-2 border-[#E8EDF2] text-[#637381] hover:text-[#1C2434]">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Entradas"  value={formatNumber(summary.entradas, 1) + ' t'} icon={ArrowDown}
          iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Total Salidas"   value={formatNumber(summary.salidas, 1)  + ' t'} icon={ArrowUp}
          iconColor="text-red-600"     iconBg="bg-red-50" />
        <StatCard title="Balance Neto"
          value={(summary.entradas - summary.salidas >= 0 ? '+' : '') + formatNumber(summary.entradas - summary.salidas, 1) + ' t'}
          icon={SlidersHorizontal}
          iconColor={summary.entradas - summary.salidas >= 0 ? 'text-[#1E88E5]' : 'text-red-600'}
          iconBg={summary.entradas - summary.salidas >= 0 ? 'bg-[#1E88E5]/10' : 'bg-red-50'} />
        <StatCard title="Registros" value={filtered.length}
          icon={Filter} iconColor="text-[#637381]" iconBg="bg-gray-100"
          footer={hasFilters ? <p className="text-xs text-[#9BAEC8]">Resultados filtrados</p> : undefined} />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1C2434]">
            <Filter className="h-4 w-4 text-[#9BAEC8]" />
            Filtros
          </div>

          <div className="flex flex-1 flex-wrap gap-3">
            <div className="space-y-1 min-w-[130px]">
              <Label className="text-xs font-medium text-[#637381]">Desde</Label>
              <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }}
                className="h-9 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
            </div>
            <div className="space-y-1 min-w-[130px]">
              <Label className="text-xs font-medium text-[#637381]">Hasta</Label>
              <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }}
                className="h-9 border-[#E8EDF2] text-sm focus:border-[#1E88E5]" />
            </div>
            <div className="space-y-1 min-w-[120px]">
              <Label className="text-xs font-medium text-[#637381]">Tipo</Label>
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9 border-[#E8EDF2]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[160px]">
              <Label className="text-xs font-medium text-[#637381]">Cliente</Label>
              <Select value={clientFilter} onValueChange={v => { setClientFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9 border-[#E8EDF2]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 min-w-[160px]">
              <Label className="text-xs font-medium text-[#637381]">Producto</Label>
              <Select value={productFilter} onValueChange={v => { setProductFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-9 border-[#E8EDF2]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {mockProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}
              className="h-9 gap-1.5 text-[#637381] hover:text-[#1C2434]">
              <X className="h-3.5 w-3.5" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Movimientos</p>
          <p className="text-xs text-[#9BAEC8]">
            {paginated.length} de {filtered.length} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E8EDF2] bg-[#F7F9FC] hover:bg-[#F7F9FC]">
                {['Fecha y Hora','Tipo','Cliente','Producto / Calidad','Toneladas','Saldo Ant.','Saldo Nuevo','Operador','Notas'].map(h => (
                  <TableHead key={h} className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#637381] ${h === 'Toneladas' || h === 'Saldo Ant.' || h === 'Saldo Nuevo' ? 'text-right' : ''}`}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((m, i) => (
                <TableRow key={m.id} className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                  <TableCell className="px-5 py-3.5 whitespace-nowrap text-sm text-[#637381]">
                    {format(m.date, 'd MMM yyyy · HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <TypeBadge type={m.type} />
                  </TableCell>
                  <TableCell className="px-5 py-3.5 max-w-[140px]">
                    <p className="truncate text-sm font-medium text-[#1C2434]">{m.clientName}</p>
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <p className="text-sm text-[#1C2434]">{m.productName.includes('Palma') ? 'Aceite de Palma' : 'GLP'}</p>
                    <p className="text-xs text-[#9BAEC8]">{m.qualityName}</p>
                  </TableCell>
                  <TableCell className={`px-5 py-3.5 text-right text-sm font-semibold tabular-nums ${
                    m.type === 'ENTRADA' ? 'text-emerald-600' : m.type === 'SALIDA' ? 'text-red-600' : 'text-[#637381]'
                  }`}>
                    {m.type === 'ENTRADA' ? '+' : m.type === 'SALIDA' ? '−' : ''}{formatNumber(m.tons, 3)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right text-sm tabular-nums text-[#9BAEC8]">
                    {formatNumber(m.previousBalance, 3)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-[#1C2434]">
                    {formatNumber(m.newBalance, 3)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-[#637381]">{m.userName}</TableCell>
                  <TableCell className="px-5 py-3.5 max-w-[160px]">
                    <p className="truncate text-xs text-[#9BAEC8]">{m.notes || '—'}</p>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No se encontraron movimientos con los filtros aplicados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E8EDF2] px-5 py-3.5">
            <p className="text-xs text-[#9BAEC8]">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#637381] transition-colors hover:bg-[#F0F4F8] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p, i) =>
                p === '…'
                  ? <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-[#9BAEC8]">…</span>
                  : <PageButton key={p} page={p as number} current={currentPage} onClick={() => setCurrentPage(p as number)} />
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#637381] transition-colors hover:bg-[#F0F4F8] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
