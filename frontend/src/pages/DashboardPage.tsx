import { Package, Users, ArrowLeftRight, Gauge, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ComposedChart,
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
    color: '#0D2137',
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
          <Card key={card.title} className="relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ backgroundColor: card.color }}
            />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5C7391]">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-[#0D2137]">{card.value}</p>
                  {card.trend !== undefined && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      {card.trend > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-[#2E7D32]" />
                          <span className="text-[#2E7D32]">+{card.trend}%</span>
                        </>
                      ) : card.trend < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-[#C62828]" />
                          <span className="text-[#C62828]">{card.trend}%</span>
                        </>
                      ) : (
                        <span className="text-[#5C7391]">{card.trendLabel}</span>
                      )}
                      {card.trend !== 0 && (
                        <span className="text-[#9BAEC8]">{card.trendLabel}</span>
                      )}
                    </div>
                  )}
                  {card.progress !== undefined && (
                    <div className="mt-3">
                      <Progress value={card.progress} className="h-2" />
                    </div>
                  )}
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  <card.icon className="h-6 w-6" style={{ color: card.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Movement Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Movimientos de los Últimos 30 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5C7391' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5C7391' }} tickLine={false} tickFormatter={v => formatNumber(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E7EF', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [
                      formatNumber(value) + ' t',
                      name === 'entrada' ? 'Entrada' : name === 'salida' ? 'Salida' : 'Ajuste',
                    ]}
                  />
                  <Legend formatter={v => v === 'entrada' ? 'Entradas' : v === 'salida' ? 'Salidas' : 'Ajustes'} />
                  <Bar dataKey="entrada" fill="#1E88E5" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="salida" fill="#E65100" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="ajuste" fill="#9BAEC8" radius={[3, 3, 0, 0]} maxBarSize={12} />
                </ComposedChart>
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="42%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-8" fontSize="20" fontWeight="bold" fill="#0D2137">
                      {formatNumber(productDistribution.reduce((s, d) => s + d.value, 0), 0)}
                    </tspan>
                    <tspan x="50%" dy="20" fontSize="11" fill="#5C7391">toneladas</tspan>
                  </text>
                  <Tooltip formatter={(value: number) => [formatTons(value), 'Toneladas']} contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E7EF', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {productDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#5C7391]">{item.name}</span>
                    </div>
                    <span className="font-medium text-[#0D2137]">{formatTons(item.value)}</span>
                  </div>
                ))}
              </div>
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
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientBalances} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7EF" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#5C7391' }} tickFormatter={v => formatNumber(v)} />
                  <YAxis type="category" dataKey="clientName" tick={{ fontSize: 10, fill: '#5C7391' }} width={130} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatTons(value), name === 'palma' ? 'Aceite de Palma' : 'GLP']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E7EF', borderRadius: '8px' }}
                  />
                  <Legend formatter={v => v === 'palma' ? 'Aceite de Palma' : 'GLP'} />
                  <Bar dataKey="palma" fill="#0D2137" radius={[0, 3, 3, 0]} maxBarSize={14} stackId="a" />
                  <Bar dataKey="glp" fill="#E65100" radius={[0, 3, 3, 0]} maxBarSize={14} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0D2137]">
              Últimos Movimientos
            </CardTitle>
            <Link
              to="/movements"
              className="text-sm font-medium text-[#1E88E5] hover:underline"
            >
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#5C7391]">Fecha</TableHead>
                  <TableHead className="text-[#5C7391]">Tipo</TableHead>
                  <TableHead className="text-[#5C7391]">Cliente</TableHead>
                  <TableHead className="text-[#5C7391]">Producto / Calidad</TableHead>
                  <TableHead className="text-right text-[#5C7391]">Toneladas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map(movement => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm text-[#5C7391]">
                      {format(movement.date, 'd MMM', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
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
                    <TableCell className="max-w-[120px] truncate text-sm text-[#0D2137]">
                      {movement.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-[#5C7391]">
                      <div>{movement.productName.split('(')[0].trim()}</div>
                      <div className="text-xs text-[#9BAEC8]">{movement.qualityName}</div>
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-medium ${
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
