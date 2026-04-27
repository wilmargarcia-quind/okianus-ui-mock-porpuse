import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, UserX, RefreshCw, Users, ShieldCheck, Truck, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { mockUsers, mockClients } from '@/data/mockData'
import type { User, UserRole } from '@/types'

interface ExtendedUser extends User {
  active: boolean
  lastAccess: Date
}

const userSchema = z.object({
  name:     z.string().min(1, 'El nombre es requerido'),
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role:     z.enum(['ADMIN', 'OPERATOR', 'CLIENT']),
  clientId: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const ROLE_META: Record<UserRole, { label: string; cls: string; icon: React.ElementType }> = {
  ADMIN:    { label: 'Administrador', cls: 'bg-[#1C2434] text-white border-transparent',       icon: ShieldCheck },
  OPERATOR: { label: 'Operador',      cls: 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20', icon: Truck },
  CLIENT:   { label: 'Cliente',       cls: 'bg-violet-50 text-violet-700 border-violet-200',   icon: Building2 },
}

function RolePill({ role }: { role: UserRole }) {
  const m = ROLE_META[role]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#E8EDF2] last:border-0">
      <span className="text-xs text-[#9BAEC8] whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-[#1C2434] text-right">{value}</span>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>(
    mockUsers.map(u => ({
      ...u,
      active: true,
      lastAccess: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }))
  )
  const [isSheetOpen, setIsSheetOpen]     = useState(false)
  const [isCreating,  setIsCreating]      = useState(false)
  const [editingUser, setEditingUser]     = useState<ExtendedUser | null>(null)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [confirmUser, setConfirmUser]     = useState<ExtendedUser | null>(null)

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } =
    useForm<UserFormData>({ resolver: zodResolver(userSchema) })

  const watchedRole = watch('role')

  function openCreateSheet() {
    setEditingUser(null); setIsCreating(true)
    reset({ name: '', email: '', password: generatePassword(), role: 'OPERATOR', clientId: '' })
    setIsSheetOpen(true)
  }

  function openEditSheet(user: ExtendedUser) {
    setEditingUser(user); setIsCreating(false)
    reset({ name: user.name, email: user.email, password: '', role: user.role, clientId: user.clientId || '' })
    setIsSheetOpen(true)
  }

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    const client = data.role === 'CLIENT' ? mockClients.find(c => c.id === data.clientId) : null

    if (isCreating) {
      setUsers(prev => [...prev, {
        id: `USR-${String(prev.length + 1).padStart(3, '0')}`,
        name: data.name, email: data.email, role: data.role,
        clientId: data.clientId || undefined, clientName: client?.name,
        active: true, lastAccess: new Date(),
      }])
      toast.success('Usuario creado exitosamente')
    } else if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id
        ? { ...u, name: data.name, email: data.email, role: data.role, clientId: data.clientId || undefined, clientName: client?.name }
        : u
      ))
      toast.success('Usuario actualizado')
    }
    setIsSubmitting(false); setIsSheetOpen(false)
  }

  const handleToggleActive = async () => {
    if (!confirmUser) return
    setUsers(prev => prev.map(u => u.id === confirmUser.id ? { ...u, active: !u.active } : u))
    toast.success(confirmUser.active ? 'Usuario desactivado' : 'Usuario activado')
    setConfirmUser(null)
  }

  const admins    = users.filter(u => u.role === 'ADMIN').length
  const operators = users.filter(u => u.role === 'OPERATOR').length
  const clients   = users.filter(u => u.role === 'CLIENT').length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Usuarios del Sistema</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Gestión de accesos y permisos por rol</p>
        </div>
        <button
          onClick={openCreateSheet}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1C2434] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total usuarios"  value={users.length}
          icon={Users}       iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Administradores" value={admins}
          icon={ShieldCheck} iconColor="text-[#1C2434]"   iconBg="bg-[#1C2434]/10" />
        <StatCard title="Operadores"      value={operators}
          icon={Truck}       iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Clientes"        value={clients}
          icon={Building2}   iconColor="text-violet-600"  iconBg="bg-violet-50" />
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Usuarios registrados ({users.length})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F7F9FC]">
                {['Nombre / Email', 'Rol', 'Cliente asociado', 'Último acceso', 'Estado', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#637381] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-b border-[#F0F4F8] hover:bg-[#F7F9FC] transition-colors ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                  {/* Name / email */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-[#1C2434]' : user.role === 'OPERATOR' ? 'bg-[#1E88E5]' : 'bg-violet-600'
                      }`}>
                        {user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1C2434]">{user.name}</p>
                        <p className="text-xs text-[#9BAEC8]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Rol */}
                  <td className="px-5 py-3.5">
                    <RolePill role={user.role} />
                  </td>
                  {/* Cliente */}
                  <td className="px-5 py-3.5 text-sm text-[#637381]">
                    {user.clientName ?? <span className="text-[#9BAEC8]">—</span>}
                  </td>
                  {/* Último acceso */}
                  <td className="px-5 py-3.5 text-sm text-[#637381] whitespace-nowrap">
                    {format(user.lastAccess, 'd MMM, HH:mm', { locale: es })}
                  </td>
                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <Switch
                      checked={user.active}
                      onCheckedChange={() => setConfirmUser(user)}
                    />
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSheet(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434] transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmUser(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-red-50 hover:text-red-600 transition-colors"
                        title={user.active ? 'Desactivar' : 'Activar'}
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">
          {/* Sheet header */}
          <div className="bg-white border-b border-[#E8EDF2] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2434] text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#1C2434] text-lg">{isCreating ? 'Nuevo Usuario' : 'Editar Usuario'}</p>
                <p className="text-sm text-[#637381]">{isCreating ? 'Ingresa los datos del usuario' : editingUser?.name}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

            <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
              {/* Name */}
              <div className="px-4 py-3.5">
                <Label htmlFor="name" className="text-xs text-[#9BAEC8] mb-1.5 block">Nombre completo *</Label>
                <Input id="name" {...register('name')} placeholder="Nombre completo" className="border-[#E8EDF2]" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              {/* Email */}
              <div className="px-4 py-3.5">
                <Label htmlFor="email" className="text-xs text-[#9BAEC8] mb-1.5 block">Email *</Label>
                <Input id="email" type="email" {...register('email')} placeholder="usuario@okianus.com" className="border-[#E8EDF2]" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              {/* Password */}
              <div className="px-4 py-3.5">
                <Label htmlFor="password" className="text-xs text-[#9BAEC8] mb-1.5 block">
                  {isCreating ? 'Contraseña temporal *' : 'Nueva contraseña (vacío = sin cambio)'}
                </Label>
                <div className="flex gap-2">
                  <Input id="password" {...register('password')} placeholder="••••••••" className="border-[#E8EDF2]" />
                  <button
                    type="button"
                    onClick={() => setValue('password', generatePassword())}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8EDF2] bg-[#F7F9FC] text-[#637381] hover:text-[#1C2434] transition-colors"
                    title="Generar contraseña"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
              {/* Role */}
              <div className="px-4 py-3.5">
                <Label className="text-xs text-[#9BAEC8] mb-1.5 block">Rol *</Label>
                <Controller name="role" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-[#E8EDF2]">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="OPERATOR">Operador</SelectItem>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>

              {/* Client selector (conditional) */}
              {watchedRole === 'CLIENT' && (
                <div className="px-4 py-3.5">
                  <Label className="text-xs text-[#9BAEC8] mb-1.5 block">Cliente asociado *</Label>
                  <Controller name="clientId" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-[#E8EDF2]">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1C2434] py-3 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isCreating ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Toggle active dialog */}
      <Dialog open={!!confirmUser} onOpenChange={open => !open && setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmUser?.active ? 'Desactivar usuario' : 'Activar usuario'}</DialogTitle>
            <DialogDescription>
              {confirmUser?.active
                ? `¿Desactivar a ${confirmUser?.name}? No podrá acceder al sistema.`
                : `¿Activar a ${confirmUser?.name}? Recuperará acceso al sistema.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUser(null)}>Cancelar</Button>
            <Button
              onClick={handleToggleActive}
              className={confirmUser?.active ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {confirmUser?.active ? 'Desactivar' : 'Activar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
