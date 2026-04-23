import { useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, LogOut } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps {
  onMenuClick: () => void
}

const pageNames: Record<string, string> = {
  '/dashboard': 'Panel Principal',
  '/inventory': 'Gestión de Inventario',
  '/movements': 'Historial de Movimientos',
  '/reports': 'Reportes Automáticos',
  '/admin/clients': 'Clientes',
  '/admin/products': 'Productos y Calidades',
  '/admin/tanks': 'Tanques Físicos',
  '/admin/users': 'Usuarios del Sistema',
  '/client/inventory': 'Mi Inventario',
  '/client/reports': 'Mis Reportes',
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const pageTitle = pageNames[location.pathname] || 'Okianus Terminal'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[#0D2137] lg:text-xl">{pageTitle}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[#5C7391]" />
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-[#E65100] p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* Date Badge */}
        <div className="hidden rounded-lg bg-[#F4F6FA] px-3 py-1.5 text-sm font-medium text-[#5C7391] md:block">
          {format(new Date(), "EEE d MMM yyyy", { locale: es })}
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E88E5] text-sm font-medium text-white">
                {user?.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <ChevronDown className="h-4 w-4 text-[#5C7391]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[#0D2137]">{user?.name}</p>
              <p className="text-xs text-[#5C7391]">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
