import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, UserCog, Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps { onMenuClick: () => void }

const pageNames: Record<string, string> = {
  '/dashboard':          'Panel Principal',
  '/inventory':          'Gestión de Inventario',
  '/movements':          'Historial de Movimientos',
  '/reports':            'Reportes Automáticos',
  '/operation/drivers':  'Pre-registro & RUNT',
  '/operation/turnos':   'Asignación de Turnos',
  '/operation/patio':    'Patio & Checklist',
  '/operation/pesaje':   'Pesaje Sicompas',
  '/operation/bahia':    'Bahía & Salida',
  '/admin/clients':      'Clientes',
  '/admin/products':     'Productos y Calidades',
  '/admin/tanks':        'Tanques Físicos',
  '/admin/users':        'Usuarios del Sistema',
  '/admin/participation':'% Participación',
  '/client/inventory':   'Mi Inventario',
  '/client/reports':     'Mis Reportes',
  '/client/vehicles':    'Mis Vehículos',
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN:    'bg-[#1E88E5]',
  OPERATOR: 'bg-emerald-600',
  CLIENT:   'bg-[#5C7391]',
}
const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin', OPERATOR: 'Operador', CLIENT: 'Cliente',
}

const SWITCH_USERS = [
  { group: 'Administración',
    users: [{ label: 'Wilmer Hernández',         email: 'admin@okianus.com',     role: 'ADMIN'    }] },
  { group: 'Operadores',
    users: [
      { label: 'Carlos Mendoza',                 email: 'operador@okianus.com',  role: 'OPERATOR' },
      { label: 'Ana Rojas',                      email: 'operador2@okianus.com', role: 'OPERATOR' },
    ]},
  { group: 'Clientes',
    users: [
      { label: 'BioEnergía S.A.',                email: 'bioe@cliente.com',      role: 'CLIENT' },
      { label: 'PetroAndina Ltda.',               email: 'petro@cliente.com',     role: 'CLIENT' },
      { label: 'Palmas del Norte',               email: 'palmas@cliente.com',    role: 'CLIENT' },
      { label: 'Combustibles del Caribe',        email: 'combus@cliente.com',    role: 'CLIENT' },
      { label: 'Refinería Costa',                email: 'refineria@cliente.com', role: 'CLIENT' },
    ]},
]

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout, switchUser } = useAuth()

  const pageTitle = pageNames[location.pathname] ?? 'Okianus Terminal'
  const initials  = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'OK'
  const roleColor = ROLE_COLOR[user?.role ?? 'OPERATOR']

  function handleSwitch(email: string, role: string) {
    switchUser(email)
    navigate(role === 'CLIENT' ? '/client/inventory' : '/dashboard')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[#0D2137] lg:text-xl">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[#5C7391]" />
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-[#E65100] p-0 text-[10px]">
            3
          </Badge>
        </Button>

        {/* Date */}
        <div className="hidden rounded-lg bg-[#F4F6FA] px-3 py-1.5 text-xs font-medium text-[#5C7391] md:block">
          {format(new Date('2026-04-24'), "EEE d MMM yyyy", { locale: es })}
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-[#F4F6FA]">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white ${roleColor}`}>
                {initials}
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-[13px] font-semibold text-[#0D2137] leading-tight">{user?.name?.split(' ')[0]}</span>
                <span className="text-[11px] text-[#9BAEC8] leading-tight">{ROLE_LABEL[user?.role ?? '']}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#9BAEC8]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            {/* Current user */}
            <div className="flex items-center gap-3 px-3 py-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${roleColor}`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0D2137]">{user?.name}</p>
                <p className="truncate text-xs text-[#5C7391]">{user?.email}</p>
                <span className={`mt-0.5 inline-block rounded-full px-1.5 py-px text-[10px] font-semibold text-white ${roleColor}`}>
                  {ROLE_LABEL[user?.role ?? '']}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Switch user section */}
            <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9BAEC8]">
              <UserCog className="h-3 w-3" /> Cambiar usuario (demo)
            </DropdownMenuLabel>

            {SWITCH_USERS.map(group => (
              <div key={group.group}>
                <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-medium text-[#9BAEC8]">{group.group}</p>
                {group.users.map(u => {
                  const isActive = user?.email === u.email
                  return (
                    <DropdownMenuItem
                      key={u.email}
                      className="flex items-center gap-2.5 cursor-pointer py-1.5"
                      onClick={() => handleSwitch(u.email, u.role)}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${ROLE_COLOR[u.role]}`}>
                        {u.label[0]}
                      </div>
                      <span className={`flex-1 text-[13px] ${isActive ? 'font-semibold text-[#0D2137]' : 'text-[#3D5166]'}`}>
                        {u.label}
                      </span>
                      {isActive && <Check className="h-3.5 w-3.5 text-[#1E88E5]" />}
                    </DropdownMenuItem>
                  )
                })}
              </div>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
