import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Activity,
  FileText,
  Settings,
  Users,
  Package,
  Database,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Anchor,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mockInventoryBalances } from '@/data/mockData'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const TOTAL_INVENTORY = mockInventoryBalances.reduce((s, b) => s + b.balance, 0)
const TODAY_MOVEMENTS = 7

const navSections = [
  {
    label: 'OPERACIÓN',
    roles: ['ADMIN', 'OPERATOR'],
    items: [
      { label: 'Panel Principal', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'Gestión de Inventario', icon: ArrowLeftRight, href: '/inventory' },
      { label: 'Movimientos', icon: Activity, href: '/movements' },
      { label: 'Reportes', icon: FileText, href: '/reports' },
    ],
  },
  {
    label: 'CONFIGURACIÓN',
    roles: ['ADMIN'],
    items: [
      {
        label: 'Administración',
        icon: Settings,
        subItems: [
          { label: 'Clientes', href: '/admin/clients', icon: Users },
          { label: 'Productos y Calidades', href: '/admin/products', icon: Package },
          { label: 'Tanques', href: '/admin/tanks', icon: Database },
          { label: 'Usuarios', href: '/admin/users', icon: Users },
        ],
      },
    ],
  },
]

const clientNav = [
  { label: 'Mi Inventario', icon: Package, href: '/client/inventory' },
  { label: 'Mis Reportes', icon: FileText, href: '/client/reports' },
]

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN: { label: 'Administrador', color: 'text-white', bg: 'bg-[#1E88E5]' },
  OPERATOR: { label: 'Operador', color: 'text-white', bg: 'bg-emerald-600' },
  CLIENT: { label: 'Cliente', color: 'text-white', bg: 'bg-[#5C7391]' },
}

function formatTons(n: number) {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n) + ' t'
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}) {
  const inner = (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/20'
          : 'text-white/60 hover:bg-white/8 hover:text-white',
        isCollapsed && 'justify-center px-0'
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-white' : 'text-white/50 group-hover:text-white'
        )}
      />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="right" className="bg-[#0D2137] text-white border-white/10">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return inner
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [adminOpen, setAdminOpen] = useState(location.pathname.startsWith('/admin'))

  const isActive = (href?: string, subs?: { href: string }[]) => {
    if (href) return location.pathname === href
    if (subs) return subs.some(s => location.pathname === s.href)
    return false
  }

  const roleConf = user ? (ROLE_CONFIG[user.role] ?? ROLE_CONFIG.OPERATOR) : ROLE_CONFIG.OPERATOR
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'OK'
  const isClient = user?.role === 'CLIENT'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 lg:relative',
          'bg-gradient-to-b from-[#0A1628] via-[#0D2137] to-[#0A1628]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[68px]' : 'w-[272px]'
        )}
      >
        {/* ── LOGO + COLLAPSE TOGGLE ── */}
        <div className="relative flex h-[64px] items-center border-b border-white/8 px-3">
          <Link
            to="/"
            className={cn('flex min-w-0 items-center gap-3', isCollapsed && 'justify-center w-full')}
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] shadow-lg shadow-[#1E88E5]/20">
              <Anchor className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-bold tracking-wide text-white">OKIANUS</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#1E88E5]">
                  Terminals
                </span>
              </div>
            )}
          </Link>

          {/* Collapse toggle — outside the Link, absolutely placed */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'absolute hidden h-6 w-6 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white/90 lg:flex',
              isCollapsed ? 'right-1 top-1/2 -translate-y-1/2' : 'right-2 top-1/2 -translate-y-1/2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ── TERMINAL STATUS STRIP (expanded, admin/operator only) ── */}
        {!isCollapsed && !isClient && (
          <div className="mx-3 mt-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Terminal Activo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                <p className="text-[10px] text-white/40">Inventario Total</p>
                <p className="mt-0.5 text-sm font-bold text-white">{formatTons(TOTAL_INVENTORY)}</p>
              </div>
              <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                <p className="text-[10px] text-white/40">Movimientos Hoy</p>
                <p className="mt-0.5 text-sm font-bold text-white">{TODAY_MOVEMENTS}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <ScrollArea className="flex-1 py-3">
          <nav className={cn('space-y-0.5', isCollapsed ? 'px-1.5' : 'px-2')}>
            {isClient ? (
              <>
                {!isCollapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Mi cuenta
                  </p>
                )}
                {clientNav.map(item => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive(item.href)}
                    isCollapsed={isCollapsed}
                    onClick={onClose}
                  />
                ))}
              </>
            ) : (
              navSections
                .filter(s => user && s.roles.some(r => r === user.role))
                .map(section => (
                  <div key={section.label} className="mb-2">
                    {!isCollapsed && (
                      <p className="mb-1 px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        {section.label}
                      </p>
                    )}
                    {section.items.map(item => {
                      if ('subItems' in item && item.subItems) {
                        if (isCollapsed) {
                          // When collapsed show sub-items icons directly
                          return item.subItems.map(sub => (
                            <NavItem
                              key={sub.href}
                              href={sub.href}
                              icon={sub.icon}
                              label={sub.label}
                              isActive={location.pathname === sub.href}
                              isCollapsed={isCollapsed}
                              onClick={onClose}
                            />
                          ))
                        }
                        return (
                          <Collapsible
                            key={item.label}
                            open={adminOpen}
                            onOpenChange={setAdminOpen}
                          >
                            <CollapsibleTrigger asChild>
                              <button
                                className={cn(
                                  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                  isActive(undefined, item.subItems)
                                    ? 'bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/20'
                                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                                )}
                              >
                                <item.icon className="h-[18px] w-[18px] shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform text-white/40',
                                    adminOpen && 'rotate-180'
                                  )}
                                />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-4">
                                {item.subItems.map(sub => (
                                  <Link
                                    key={sub.href}
                                    to={sub.href}
                                    onClick={onClose}
                                    className={cn(
                                      'block rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                                      location.pathname === sub.href
                                        ? 'font-medium text-[#1E88E5]'
                                        : 'text-white/50 hover:text-white'
                                    )}
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      }

                      const navItem = item as { label: string; icon: React.ElementType; href: string }
                      return (
                        <NavItem
                          key={navItem.href}
                          href={navItem.href}
                          icon={navItem.icon}
                          label={navItem.label}
                          isActive={isActive(navItem.href)}
                          isCollapsed={isCollapsed}
                          onClick={onClose}
                        />
                      )
                    })}
                  </div>
                ))
            )}
          </nav>
        </ScrollArea>

        {/* ── USER CARD ── */}
        <div className="border-t border-white/8 p-3">
          {!isCollapsed ? (
            <div className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2.5">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold', roleConf.bg)}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
                  <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', roleConf.bg, roleConf.color)}>
                    {roleConf.label}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/8 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center rounded-lg py-2 text-white/40 hover:bg-white/8 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0D2137] text-white border-white/10">
                  Cerrar sesión
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </aside>
    </>
  )
}
