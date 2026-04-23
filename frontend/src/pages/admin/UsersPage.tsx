import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, UserX, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { mockUsers, mockClients } from '@/data/mockData'
import type { User, UserRole } from '@/types'

interface ExtendedUser extends User {
  active: boolean
  lastAccess: Date
}

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['ADMIN', 'OPERATOR', 'CLIENT']),
  clientId: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>(
    mockUsers.map(u => ({
      ...u,
      active: true,
      lastAccess: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }))
  )
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<ExtendedUser | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const watchedRole = watch('role')

  const openCreateSheet = () => {
    setSelectedUser(null)
    setIsCreating(true)
    reset({
      name: '',
      email: '',
      password: generatePassword(),
      role: 'OPERATOR',
      clientId: '',
    })
    setIsSheetOpen(true)
  }

  const openEditSheet = (user: ExtendedUser) => {
    setSelectedUser(user)
    setIsCreating(false)
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      clientId: user.clientId || '',
    })
    setIsSheetOpen(true)
  }

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    if (isCreating) {
      const client = data.role === 'CLIENT' ? mockClients.find(c => c.id === data.clientId) : null
      const newUser: ExtendedUser = {
        id: `USR-${String(users.length + 1).padStart(3, '0')}`,
        name: data.name,
        email: data.email,
        role: data.role,
        clientId: data.clientId || undefined,
        clientName: client?.name,
        active: true,
        lastAccess: new Date(),
      }
      setUsers(prev => [...prev, newUser])
      toast.success('Usuario creado exitosamente')
    } else if (selectedUser) {
      const client = data.role === 'CLIENT' ? mockClients.find(c => c.id === data.clientId) : null
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: data.name,
                email: data.email,
                role: data.role,
                clientId: data.clientId || undefined,
                clientName: client?.name,
              }
            : u
        )
      )
      toast.success('Usuario actualizado exitosamente')
    }

    setIsSubmitting(false)
    setIsSheetOpen(false)
  }

  const handleDeactivate = async () => {
    if (!userToDeactivate) return

    await new Promise(resolve => setTimeout(resolve, 500))

    setUsers(prev =>
      prev.map(u => (u.id === userToDeactivate.id ? { ...u, active: !u.active } : u))
    )

    toast.success(userToDeactivate.active ? 'Usuario desactivado' : 'Usuario activado')
    setShowDeactivateDialog(false)
    setUserToDeactivate(null)
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-[#0D2137] text-white">Administrador</Badge>
      case 'OPERATOR':
        return <Badge className="bg-[#1E88E5] text-white">Operador</Badge>
      case 'CLIENT':
        return <Badge className="bg-[#5C7391] text-white">Cliente</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0D2137]">Usuarios del Sistema</h2>
          <p className="text-[#5C7391]">Administra los usuarios y sus permisos</p>
        </div>
        <Button onClick={openCreateSheet} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Cliente Asociado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-[#0D2137]">{user.name}</TableCell>
                    <TableCell className="text-[#5C7391]">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-[#5C7391]">
                      {user.clientName || '-'}
                    </TableCell>
                    <TableCell className="text-[#5C7391]">
                      {format(user.lastAccess, 'd MMM yyyy, HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.active}
                        onCheckedChange={() => {
                          setUserToDeactivate(user)
                          setShowDeactivateDialog(true)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditSheet(user)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-[#5C7391]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToDeactivate(user)
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

      {/* User Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{isCreating ? 'Nuevo Usuario' : 'Editar Usuario'}</SheetTitle>
            <SheetDescription>
              {isCreating ? 'Ingresa los datos del nuevo usuario' : 'Modifica los datos del usuario'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del usuario"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="usuario@ejemplo.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isCreating ? 'Contraseña temporal *' : 'Nueva contraseña (dejar vacío para no cambiar)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue('password', generatePassword())}
                  title="Generar contraseña"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="OPERATOR">Operador</SelectItem>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {watchedRole === 'CLIENT' && (
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente Asociado *</Label>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
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
              </div>
            )}

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
                'Guardar Usuario'
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
              {userToDeactivate?.active ? 'Desactivar usuario' : 'Activar usuario'}
            </DialogTitle>
            <DialogDescription>
              {userToDeactivate?.active
                ? `¿Desactivar al usuario ${userToDeactivate?.name}? No podrá acceder al sistema.`
                : `¿Activar al usuario ${userToDeactivate?.name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeactivate}
              className={
                userToDeactivate?.active
                  ? 'bg-[#C62828] hover:bg-[#B71C1C]'
                  : 'bg-[#2E7D32] hover:bg-[#1B5E20]'
              }
            >
              {userToDeactivate?.active ? 'Desactivar' : 'Activar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
