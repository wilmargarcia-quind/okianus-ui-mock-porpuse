import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText, Download, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/contexts/AuthContext'
import { getClientDailyReports, formatNumber } from '@/data/mockData'
import type { Report } from '@/types'

export default function ClientReportsPage() {
  const { user } = useAuth()
  const clientId = user?.clientId || 'CLI-001'
  const [monthFilter, setMonthFilter] = useState('2026-04')
  const clientReports = useMemo(() => getClientDailyReports(clientId), [clientId])

  const filteredReports = useMemo(() => {
    return clientReports.filter(report => {
      const reportMonth = format(report.date, 'yyyy-MM')
      return reportMonth === monthFilter
    })
  }, [clientReports, monthFilter])

  const handleDownload = (type: 'pdf' | 'excel', report: Report) => {
    toast.info('Descargando...', {
      description: `Preparando archivo ${type.toUpperCase()} del ${format(report.date, 'd MMM yyyy', { locale: es })}.`,
    })
  }

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge className="bg-gray-100 text-gray-700">PENDIENTE</Badge>
      case 'GENERADO':
        return <Badge className="bg-blue-100 text-blue-700">GENERADO</Badge>
      case 'ENVIADO':
        return <Badge className="bg-green-100 text-green-700">ENVIADO</Badge>
      case 'FALLIDO':
        return <Badge className="bg-red-100 text-red-700">FALLIDO</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Mis Reportes</h2>
        <p className="text-[#5C7391]">{user?.clientName || 'Cliente'}</p>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-[#1E88E5]">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5]/10">
            <Clock className="h-6 w-6 text-[#1E88E5]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0D2137]">Reportes Diarios Automáticos</h3>
            <p className="text-sm text-[#5C7391]">
              Los reportes se generan automáticamente cada día a las 23:59 y se envían a su correo
              registrado. Puede descargarlos en formato PDF o Excel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Historial de Reportes</CardTitle>
              <CardDescription>
                {filteredReports.length} reportes en el período seleccionado
              </CardDescription>
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-04">Abril 2026</SelectItem>
                <SelectItem value="2026-03">Marzo 2026</SelectItem>
                <SelectItem value="2026-02">Febrero 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Saldo Inicial (t)</TableHead>
                  <TableHead className="text-right">Entradas (t)</TableHead>
                  <TableHead className="text-right">Salidas (t)</TableHead>
                  <TableHead className="text-right">Saldo Final (t)</TableHead>
                  <TableHead>Descargar PDF</TableHead>
                  <TableHead>Descargar Excel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-[#0D2137]">
                      {format(report.date, 'd MMMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right text-[#5C7391]">
                      {formatNumber(report.initialBalance, 3)}
                    </TableCell>
                    <TableCell className="text-right text-[#2E7D32]">
                      +{formatNumber(report.entries, 3)}
                    </TableCell>
                    <TableCell className="text-right text-[#C62828]">
                      -{formatNumber(report.exits, 3)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0D2137]">
                      {formatNumber(report.finalBalance, 3)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload('pdf', report)}
                        disabled={report.status === 'PENDIENTE'}
                        className="h-8"
                      >
                        <FileText className="mr-1 h-4 w-4 text-[#C62828]" />
                        PDF
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload('excel', report)}
                        disabled={report.status === 'PENDIENTE'}
                        className="h-8"
                      >
                        <Download className="mr-1 h-4 w-4 text-[#2E7D32]" />
                        Excel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
