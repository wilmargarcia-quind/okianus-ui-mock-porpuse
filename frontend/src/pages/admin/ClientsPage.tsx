import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, UserX, Users, UserCheck, Building2, Search, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { mockClients } from '@/data/mockData'
import type { Client } from '@/types'

// ─── schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  code:  z.string().min(3, 'El código es requerido'),
  name:  z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

// ─── helpers ──────────────────────────────────────────────────────────────────

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients,             setClients]             = useState(mockClients)
  const [search,              setSearch]              = useState('')
  const [selectedClient,      setSelectedClient]      = useState<Client | null>(null)
  const [isSheetOpen,         setIsSheetOpen]         = useState(false)
  const [isCreating,          setIsCreating]          = useState(false)
  const [isSubmitting,        setIsSubmitting]        = useState(false)
  const [showDeactivateDlg,   setShowDeactivateDlg]   = useState(false)
  const [clientToToggle,      setClientToToggle]      = useState<Client | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  })

  const stats = {
    total:    clients.length,
    active:   clients.filter(c => c.active).length,
    inactive: clients.filter(c => !c.active).length,
  }

  const openCreate = () => {
    setSelectedClient(null); setIsCreating(true)
    reset({ code: '', name: '', email: '', phone: '', notes: '' })
    setIsSheetOpen(true)
  }

  const openEdit = (c: Client) => {
    setSelectedClient(c); setIsCreating(false)
    reset({ code: c.code, name: c.name, email: c.email, phone: c.phone ?? '', notes: c.notes ?? '' })
    setIsSheetOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    if (isCreating) {
      setClients(prev => [...prev, { id: data.code, ...data, active: true, usersCount: 0 }])
      toast.success('Cliente creado')
    } else if (selectedClient) {
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...data } : c))
      toast.success('Cliente actualizado')
    }
    setIsSubmitting(false); setIsSheetOpen(false)
  }

  const handleToggle = async () => {
    if (!clientToToggle) return
    await new Promise(r => setTimeout(r, 400))
    setClients(prev => prev.map(c => c.id === clientToToggle.id ? { ...c, active: !c.active } : c))
    toast.success(clientToToggle.active ? 'Cliente desactivado' : 'Cliente activado')
    setShowDeactivateDlg(false); setClientToToggle(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Clientes</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Administra los clientes del terminal</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[#1E88E5] hover:bg-[#1565C0] shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Clientes"   value={stats.total}    icon={Building2}  iconColor="text-[#1E88E5]"   iconBg="bg-[#1E88E5]/10" />
        <StatCard title="Activos"          value={stats.active}   icon={UserCheck}  iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="Inactivos"        value={stats.inactive} icon={UserX}      iconColor="text-[#637381]"   iconBg="bg-gray-100" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E8EDF2] px-5 py-3.5">
          <p className="text-sm font-semibold text-[#1C2434]">Lista de clientes</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9BAEC8]" />
            <Input
              placeholder="Buscar cliente…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 border-[#E8EDF2] pl-8 text-sm focus:border-[#1E88E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E8EDF2] bg-[#F7F9FC] hover:bg-[#F7F9FC]">
                {['Código','Nombre','Email de reportes','Teléfono','Usuarios','Estado','Acciones'].map(h => (
                  <TableHead key={h} className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#637381]">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow key={c.id} className={`border-b border-[#F0F4F8] transition-colors hover:bg-[#F7F9FC] ${i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}`}>
                  <TableCell className="px-5 py-3.5 font-mono text-xs text-[#9BAEC8]">{c.code}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E88E5]/10 text-xs font-bold text-[#1E88E5]">
                        {c.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#1C2434]">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-[#637381]">{c.email}</TableCell>
                  <TableCell className="px-5 py-3.5 text-sm text-[#637381]">{c.phone ?? '—'}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-[#637381]">
                      <Users className="h-3 w-3" />{c.usersCount}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <StatusPill active={c.active} />
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#637381] transition-colors hover:bg-[#F0F4F8] hover:text-[#1C2434]"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setClientToToggle(c); setShowDeactivateDlg(true) }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#637381] transition-colors hover:bg-red-50 hover:text-red-600"
                        title={c.active ? 'Desactivar' : 'Activar'}
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-[#9BAEC8]">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-[#E8EDF2] px-5 py-3 text-xs text-[#9BAEC8]">
          {filtered.length} de {clients.length} clientes
        </div>
      </div>

      {/* ── Form Sheet ──────────────────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F7F9FC]">

          {/* Header */}
          <div className="bg-white border-b border-[#E8EDF2] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2434] text-white shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#1C2434] text-lg leading-tight">
                  {isCreating ? 'Nuevo Cliente' : 'Editar Cliente'}
                </p>
                <p className="text-sm text-[#637381] mt-0.5">
                  {isCreating ? 'Registrar nuevo cliente en el terminal' : selectedClient?.name}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

            {/* Identificación */}
            <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
              {selectedClient && !isCreating ? (
                <div className="px-4 py-3.5">
                  <Label className="text-xs text-[#9BAEC8] mb-1.5 block">Código</Label>
                  <Input value={selectedClient.code} disabled
                    className="border-[#E8EDF2] bg-[#F7F9FC] font-mono text-sm h-10" />
                </div>
              ) : (
                <div className="px-4 py-3.5">
                  <Label htmlFor="code" className="text-xs text-[#9BAEC8] mb-1.5 block">
                    Código <span className="text-red-400">*</span>
                  </Label>
                  <Input id="code" {...register('code')} placeholder="CLI-011"
                    className={`border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5] ${errors.code ? 'border-red-400' : ''}`} />
                  {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                </div>
              )}
              <div className="px-4 py-3.5">
                <Label htmlFor="name" className="text-xs text-[#9BAEC8] mb-1.5 block">
                  Razón social <span className="text-red-400">*</span>
                </Label>
                <Input id="name" {...register('name')} placeholder="Nombre de la empresa"
                  className={`border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5] ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            {/* Contacto */}
            <div className="rounded-xl border border-[#E8EDF2] bg-white divide-y divide-[#E8EDF2] shadow-sm overflow-hidden">
              <div className="px-4 py-3.5">
                <Label htmlFor="email" className="text-xs text-[#9BAEC8] mb-1.5 block">
                  Email de reportes <span className="text-red-400">*</span>
                </Label>
                <Input id="email" type="email" {...register('email')} placeholder="reportes@empresa.com"
                  className={`border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5] ${errors.email ? 'border-red-400' : ''}`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="px-4 py-3.5">
                <Label htmlFor="phone" className="text-xs text-[#9BAEC8] mb-1.5 block">Teléfono</Label>
                <Input id="phone" {...register('phone')} placeholder="+57 300 000 0000"
                  className="border-[#E8EDF2] text-sm h-10 focus:border-[#1E88E5]" />
              </div>
            </div>

            {/* Notas */}
            <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3.5">
                <Label htmlFor="notes" className="text-xs text-[#9BAEC8] mb-1.5 block">Notas adicionales</Label>
                <Textarea id="notes" {...register('notes')} rows={3}
                  placeholder="Observaciones, acuerdos especiales, información relevante…"
                  className="border-[#E8EDF2] text-sm focus:border-[#1E88E5] resize-none" />
              </div>
            </div>

            {/* Actions */}
            <button type="submit" disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1C2434] py-3 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isCreating ? 'Crear cliente' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setIsSheetOpen(false)}
              className="w-full rounded-xl border border-[#E8EDF2] bg-white py-2.5 text-sm font-medium text-[#637381] hover:text-[#1C2434] hover:border-[#1C2434] transition-colors">
              Cancelar
            </button>
          </form>
        </SheetContent>
      </Sheet>

      {/* ── Confirm toggle dialog ────────────────────────────────────────────── */}
      <Dialog open={showDeactivateDlg} onOpenChange={setShowDeactivateDlg}>
        <DialogContent className="rounded-2xl border-[#E8EDF2] shadow-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1C2434]">
              {clientToToggle?.active ? 'Desactivar cliente' : 'Activar cliente'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#637381]">
              {clientToToggle?.active
                ? '¿Desactivar este cliente? No afecta movimientos históricos.'
                : '¿Reactivar este cliente?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeactivateDlg(false)}
              className="border-[#E8EDF2] text-[#637381]">
              Cancelar
            </Button>
            <Button onClick={handleToggle}
              className={clientToToggle?.active ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}>
              {clientToToggle?.active ? 'Desactivar' : 'Activar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
