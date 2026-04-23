import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { mockClients } from '@/data/mockData'
import type { Client } from '@/types'

const clientSchema = z.object({
  code: z.string().min(3, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [clientToDeactivate, setClientToDeactivate] = useState<Client | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const openCreateSheet = () => {
    setSelectedClient(null)
    setIsCreating(true)
    reset({ code: '', name: '', email: '', phone: '', notes: '' })
    setIsSheetOpen(true)
  }

  const openEditSheet = (client: Client) => {
    setSelectedClient(client)
    setIsCreating(false)
    reset({
      code: client.code,
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      notes: client.notes || '',
    })
    setIsSheetOpen(true)
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    if (isCreating) {
      const newClient: Client = {
        id: data.code,
        code: data.code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
        active: true,
        usersCount: 0,
      }
      setClients(prev => [...prev, newClient])
      toast.success('Cliente creado exitosamente')
    } else if (selectedClient) {
      setClients(prev =>
        prev.map(c =>
          c.id === selectedClient.id
            ? { ...c, name: data.name, email: data.email, phone: data.phone, notes: data.notes }
            : c
        )
      )
      toast.success('Cliente actualizado exitosamente')
    }

    setIsSubmitting(false)
    setIsSheetOpen(false)
  }

  const handleDeactivate = async () => {
    if (!clientToDeactivate) return

    await new Promise(resolve => setTimeout(resolve, 500))

    setClients(prev =>
      prev.map(c => (c.id === clientToDeactivate.id ? { ...c, active: !c.active } : c))
    )

    toast.success(
      clientToDeactivate.active ? 'Cliente desactivado' : 'Cliente activado',
      {
        description: 'Los movimientos históricos no se verán afectados.',
      }
    )

    setShowDeactivateDialog(false)
    setClientToDeactivate(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0D2137]">Clientes</h2>
          <p className="text-[#5C7391]">Administra los clientes del terminal</p>
        </div>
        <Button onClick={openCreateSheet} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email de Reportes</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-mono text-sm text-[#5C7391]">
                      {client.code}
                    </TableCell>
                    <TableCell className="font-medium text-[#0D2137]">{client.name}</TableCell>
                    <TableCell className="text-[#5C7391]">{client.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.usersCount} usuarios</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={client.active}
                        onCheckedChange={() => {
                          setClientToDeactivate(client)
                          setShowDeactivateDialog(true)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditSheet(client)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-[#5C7391]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setClientToDeactivate(client)
                            setShowDeactivateDialog(true)
                          }}
                          className="h-8 w-8"
                        >
                          <UserX className="h-4 w-4 text-[#C62828]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Client Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{isCreating ? 'Nuevo Cliente' : 'Editar Cliente'}</SheetTitle>
            <SheetDescription>
              {isCreating
                ? 'Ingresa los datos del nuevo cliente'
                : 'Modifica los datos del cliente'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {selectedClient && (
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={selectedClient.code} disabled className="bg-muted" />
              </div>
            )}

            {isCreating && (
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="CLI-011"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre de la empresa"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de reportes *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="reportes@empresa.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de contacto</Label>
              <Input id="phone" {...register('phone')} placeholder="+57 300 000 0000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Notas adicionales sobre el cliente..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0D2137] hover:bg-[#1A3A5C]"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {clientToDeactivate?.active ? 'Desactivar cliente' : 'Activar cliente'}
            </DialogTitle>
            <DialogDescription>
              {clientToDeactivate?.active
                ? '¿Desactivar este cliente? Los movimientos históricos no se verán afectados.'
                : '¿Activar este cliente nuevamente?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeactivate}
              className={
                clientToDeactivate?.active
                  ? 'bg-[#C62828] hover:bg-[#B71C1C]'
                  : 'bg-[#2E7D32] hover:bg-[#1B5E20]'
              }
            >
              {clientToDeactivate?.active ? 'Desactivar' : 'Activar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
