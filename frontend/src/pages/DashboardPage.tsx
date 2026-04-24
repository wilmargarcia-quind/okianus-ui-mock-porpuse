import { Package, Users, ArrowLeftRight, Gauge, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getDashboardStats,
  getMovementChartData,
  getProductDistribution,
  getClientBalances,
  mockMovements,
  formatNumber,
  formatTons,
} from '@/data/mockData'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const stats = getDashboardStats()
const movementData = getMovementChartData()
const productDistribution = getProductDistribution()
const clientBalances = getClientBalances()
const recentMovements = mockMovements.slice(0, 8)

const kpiCards = [
  {
    title: 'Inventario Total',
    value: formatNumber(stats.totalInventory, 3) + ' t',
    icon: Package,
    color: '#1E88E5',
    trend: stats.inventoryTrend,
    trendLabel: 'vs ayer',
  },
  {
    title: 'Clientes Activos',
    value: stats.activeClients.toString(),
    icon: Users,
    color: '#2E7D32',
    trend: 0,
    trendLabel: 'sin cambios',
  },
  {
    title: 'Movimientos Hoy',
    value: stats.todayMovements.toString(),
    icon: ArrowLeftRight,
    color: '#E65100',
    trend: 2,
    trendLabel: 'vs promedio',
  },
  {
    title: 'Capacidad Utilizada',
    value: stats.capacityUsed + '%',
    icon: Gauge,
    color: '#7B1FA2',
    progress: stats.capacityUsed,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Panel Principal</h2>
        <p className="text-[#5C7391]">Visión operativa en tiempo real del terminal</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(card => (
          <Card
            key={card.title}
            className="relative overflow-hidden border-0 shadow-sm"
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            {/* Subtle color wash */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-20 opacity-[0.06]"
              style={{ background: `radial-gradient(circle at right, ${card.color}, transparent)` }}
            />
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5C7391]">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#0D2137]">
                    {card.value}
                  </p>
                  {card.trend !== undefined && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      {card.trend > 0 ? (
                        <>
                          <TrendingUp className="h-3.5 w-3.5 text-[#2E7D32]" />
                          <span className="text-[#2E7D32] font-medium">+{card.trend}%</span>
                          <span className="text-[#9BAEC8]">{card.trendLabel}</span>
                        </>
                      ) : card.trend < 0 ? (
                        <>
                          <TrendingDown className="h-3.5 w-3.5 text-[#C62828]" />
                          <span className="text-[#C62828] font-medium">{card.trend}%</span>
                          <span className="text-[#9BAEC8]">{card.trendLabel}</span>
                        </>
                      ) : (
                        <span className="text-[#9BAEC8]">{card.trendLabel}</span>
                      )}
                    </div>
                  )}
                  {card.progress !== undefined && (
                    <div className="mt-3">
                      <Progress value={card.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
                <div
                  className="ml-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: card.color + '18' }}
                >
                  <card.icon className="h-7 w-7" style={{ color: card.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Movement Area Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Movimientos de los Últimos 30 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementData}>
                  <defs>
                    <linearGradient id="gradEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradSalida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E65100" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E65100" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#5C7391' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#5C7391' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => formatNumber(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E0E7EF',
                      borderRadius: '10px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number, name: string) => [
                      formatNumber(value) + ' t',
                      name === 'entrada' ? 'Entradas' : 'Salidas',
                    ]}
                  />
                  <Legend
                    formatter={v => (
                      <span className="text-sm text-[#5C7391]">
                        {v === 'entrada' ? 'Entradas' : 'Salidas'}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="entrada"
                    stroke="#1E88E5"
                    strokeWidth={2}
                    fill="url(#gradEntrada)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#1E88E5', strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="salida"
                    stroke="#E65100"
                    strokeWidth={2}
                    fill="url(#gradSalida)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#E65100', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Distribución por Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-6" fontSize="20" fontWeight="bold" fill="#0D2137">
                      {formatNumber(productDistribution.reduce((s, d) => s + d.value, 0), 0)}
                    </tspan>
                    <tspan x="50%" dy="18" fontSize="11" fill="#5C7391">toneladas</tspan>
                  </text>
                  <Tooltip
                    formatter={(value: number) => [formatTons(value), 'Toneladas']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E0E7EF',
                      borderRadius: '10px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
              {productDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#5C7391]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#0D2137]">{formatTons(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-11">
        {/* Client Balances */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Saldo por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientBalances} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#5C7391' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => formatNumber(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="clientName"
                    width={105}
                    tickLine={false}
                    axisLine={false}
                    tick={({ x, y, payload }) => (
                      <text x={x} y={y} dy={4} textAnchor="end" fontSize={10} fill="#5C7391">
                        {(payload.value as string).length > 13
                          ? (payload.value as string).slice(0, 12) + '…'
                          : payload.value}
                      </text>
                    )}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatTons(value),
                      name === 'palma' ? 'Aceite de Palma' : 'GLP',
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E0E7EF',
                      borderRadius: '10px',
                    }}
                  />
                  <Legend
                    formatter={v => (
                      <span className="text-sm text-[#5C7391]">
                        {v === 'palma' ? 'Aceite de Palma' : 'GLP'}
                      </span>
                    )}
                  />
                  <Bar dataKey="palma" fill="#0D2137" radius={[0, 3, 3, 0]} maxBarSize={14} stackId="a" />
                  <Bar dataKey="glp" fill="#E65100" radius={[0, 3, 3, 0]} maxBarSize={14} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Últimos Movimientos
            </CardTitle>
            <Link to="/movements" className="text-sm font-medium text-[#1E88E5] hover:underline">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E0E7EF]">
                  <TableHead className="pl-6 text-[#5C7391]">Fecha</TableHead>
                  <TableHead className="text-[#5C7391]">Tipo</TableHead>
                  <TableHead className="text-[#5C7391]">Cliente</TableHead>
                  <TableHead className="text-[#5C7391]">Producto</TableHead>
                  <TableHead className="pr-6 text-right text-[#5C7391]">Ton.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map(movement => (
                  <TableRow key={movement.id} className="border-b border-[#F0F4F8]">
                    <TableCell className="pl-6 text-sm text-[#5C7391]">
                      {format(movement.date, 'd MMM', { locale: es })}
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
                    <TableCell className="max-w-[100px] truncate text-sm text-[#0D2137]">
                      {movement.clientName.split(' ')[0]}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-[#5C7391]">
                        {movement.productName.includes('Palma') ? 'Palma' : 'GLP'}
                      </div>
                      <div className="text-xs text-[#9BAEC8]">{movement.qualityName}</div>
                    </TableCell>
                    <TableCell
                      className={`pr-6 text-right text-sm font-semibold ${
                        movement.type === 'ENTRADA'
                          ? 'text-[#2E7D32]'
                          : movement.type === 'SALIDA'
                          ? 'text-[#C62828]'
                          : 'text-[#5C7391]'
                      }`}
                    >
                      {movement.type === 'ENTRADA' ? '+' : movement.type === 'SALIDA' ? '-' : ''}
                      {formatNumber(movement.tons, 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
