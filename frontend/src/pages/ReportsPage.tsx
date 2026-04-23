import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Play, FileText, Download, RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockClients, mockReports } from '@/data/mockData'
import type { Report } from '@/types'

export default function ReportsPage() {
  const [monthFilter, setMonthFilter] = useState('2026-04')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [clientEmailSettings, setClientEmailSettings] = useState(
    mockClients.reduce((acc, client) => {
      acc[client.id] = true
      return acc
    }, {} as Record<string, boolean>)
  )
  const [sendTime, setSendTime] = useState('23:59')

  const filteredReports = mockReports.filter(report => {
    if (statusFilter !== 'all' && report.status !== statusFilter) return false
    const reportMonth = format(report.date, 'yyyy-MM')
    if (reportMonth !== monthFilter) return false
    return true
  })

  const handleGenerateNow = async () => {
    setShowConfirmDialog(false)
    setIsGenerating(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Reporte generado exitosamente', {
      description: 'Se han generado los reportes para todos los clientes activos.',
    })

    setIsGenerating(false)
  }

  const handleDownload = (type: 'pdf' | 'excel') => {
    toast.info('Descargando...', {
      description: `Preparando archivo ${type.toUpperCase()} para descarga.`,
    })
  }

  const handleResend = (report: Report) => {
    toast.success('Reporte reenviado', {
      description: `Se ha reenviado el reporte del ${format(report.date, 'd MMM yyyy', { locale: es })} a los clientes.`,
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
        <h2 className="text-2xl font-bold text-[#0D2137]">Reportes Automáticos</h2>
        <p className="text-[#5C7391]">
          Módulo M2 · Cierre de día automático con envío por email a cada cliente
        </p>
      </div>

      {/* Scheduler Config */}
      <Card className="border-l-4 border-l-[#1E88E5]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5]/10">
              <Clock className="h-6 w-6 text-[#1E88E5]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0D2137]">
                Cierre Automático Diario configurado a las 23:59
              </h3>
              <p className="text-sm text-[#5C7391]">
                Se generan reportes individuales PDF + Excel para cada cliente activo y se envían a
                su email registrado.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isGenerating}
            className="bg-[#0D2137] text-white hover:bg-[#1A3A5C]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generar Reporte Ahora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Historial de Reportes</CardTitle>
            <div className="flex items-center gap-3">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="GENERADO">Generado</SelectItem>
                  <SelectItem value="ENVIADO">Enviado</SelectItem>
                  <SelectItem value="FALLIDO">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Operativa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Clientes Incluidos</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>Excel</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-[#0D2137]">
                      {format(report.date, 'd MMMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-[#F4F6FA] px-2 py-1 text-sm text-[#5C7391]">
                        {report.clientsIncluded} clientes
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload('pdf')}
                        disabled={report.status === 'PENDIENTE'}
                        className="h-8 w-8"
                      >
                        <FileText className="h-4 w-4 text-[#C62828]" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload('excel')}
                        disabled={report.status === 'PENDIENTE'}
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4 text-[#2E7D32]" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {(report.status === 'ENVIADO' || report.status === 'FALLIDO') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResend(report)}
                          className="h-8"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Reenviar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#5C7391]" />
            <CardTitle className="text-lg">Configuración de Envío</CardTitle>
          </div>
          <CardDescription>
            Activa o desactiva el envío automático de reportes para cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Label htmlFor="sendTime">Hora de envío:</Label>
            <Input
              id="sendTime"
              type="time"
              value={sendTime}
              onChange={e => setSendTime(e.target.value)}
              className="h-9 w-28"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Hora de envío actualizada')}
            >
              Guardar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockClients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#0D2137]">{client.name}</p>
                  <p className="truncate text-sm text-[#5C7391]">{client.email}</p>
                </div>
                <Switch
                  checked={clientEmailSettings[client.id]}
                  onCheckedChange={checked =>
                    setClientEmailSettings(prev => ({ ...prev, [client.id]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Reporte Ahora</DialogTitle>
            <DialogDescription>
              Se generarán reportes PDF y Excel para todos los clientes activos con los datos hasta
              el momento actual. ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateNow} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
              Generar Ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
