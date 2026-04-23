import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, Layers, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import {
  mockInventoryBalances,
  mockMovements,
  formatNumber,
  formatTons,
  getClientMovementHistory,
} from '@/data/mockData'
import { subDays } from 'date-fns'

const COLORS = ['#0D2137', '#1E88E5', '#1A3A5C', '#E65100', '#5C7391']

export default function ClientInventoryPage() {
  const { user } = useAuth()
  const clientId = user?.clientId || 'CLI-001'
  const clientName = user?.clientName || 'BioEnergía S.A.'

  // Filter data for this client
  const clientBalances = useMemo(
    () => mockInventoryBalances.filter(b => b.clientId === clientId),
    [clientId]
  )

  const clientMovements = useMemo(
    () => mockMovements.filter(m => m.clientId === clientId).slice(0, 15),
    [clientId]
  )

  const totalBalance = useMemo(
    () => clientBalances.reduce((acc, b) => acc + b.balance, 0),
    [clientBalances]
  )

  const productCount = clientBalances.length

  const lastMovement = clientMovements[0]

  // Generate evolution chart data (deterministic)
  const evolutionData = useMemo(() => getClientMovementHistory(clientId), [clientId])

  // Distribution data for pie chart
  const distributionData = useMemo(
    () =>
      clientBalances.map((b, index) => ({
        name: `${b.productName} ${b.qualityName}`,
        value: b.balance,
        color: COLORS[index % COLORS.length],
      })),
    [clientBalances]
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Mi Inventario</h2>
        <p className="text-[#5C7391]">{clientName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#5C7391]">Total en Toneladas</p>
                <p className="mt-2 text-2xl font-bold text-[#0D2137]">{formatTons(totalBalance)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5]/10">
                <Package className="h-6 w-6 text-[#1E88E5]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#5C7391]">Productos</p>
                <p className="mt-2 text-2xl font-bold text-[#0D2137]">{productCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E7D32]/10">
                <Layers className="h-6 w-6 text-[#2E7D32]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#5C7391]">Último Movimiento</p>
                <p className="mt-2 text-2xl font-bold text-[#0D2137]">
                  {lastMovement ? format(lastMovement.date, 'd MMM', { locale: es }) : '-'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E65100]/10">
                <Calendar className="h-6 w-6 text-[#E65100]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Evolución de Inventario - Últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#5C7391' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#5C7391' }}
                    tickLine={false}
                    tickFormatter={value => formatNumber(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E0E7EF',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatTons(value), 'Total']}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1E88E5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#1E88E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatTons(value), 'Toneladas']} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={value => <span className="text-xs text-[#5C7391]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saldos Detallados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Calidad</TableHead>
                <TableHead className="text-right">Saldo Actual (t)</TableHead>
                <TableHead>Último Movimiento</TableHead>
                <TableHead>Tendencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientBalances.map(balance => {
                // Calcular tendencia real basada en movimientos del día anterior
                const isUp = (() => {
                  const yesterday = clientMovements.filter(m =>
                    m.qualityId === balance.qualityId &&
                    format(m.date, 'yyyy-MM-dd') === format(subDays(new Date('2026-04-23'), 1), 'yyyy-MM-dd')
                  )
                  if (yesterday.length === 0) return null
                  return yesterday.some(m => m.type === 'ENTRADA')
                })()
                return (
                  <TableRow key={balance.id}>
                    <TableCell className="font-medium text-[#0D2137]">
                      {balance.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{balance.qualityName}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0D2137]">
                      {formatNumber(balance.balance, 3)}
                    </TableCell>
                    <TableCell className="text-[#5C7391]">
                      {format(balance.lastMovementDate, 'd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {isUp === null ? (
                        <span className="text-sm text-[#9BAEC8]">—</span>
                      ) : isUp ? (
                        <div className="flex items-center gap-1 text-[#2E7D32]">
                          <TrendingUp className="h-4 w-4" /><span className="text-sm">Entrada reciente</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#C62828]">
                          <TrendingDown className="h-4 w-4" /><span className="text-sm">Salida reciente</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Calidad</TableHead>
                <TableHead className="text-right">Toneladas</TableHead>
                <TableHead className="text-right">Saldo Nuevo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientMovements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell className="text-[#5C7391]">
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
                      {movement.type}
                    </Badge>
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
                  <TableCell className="text-right font-medium">
                    {formatNumber(movement.newBalance, 3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
