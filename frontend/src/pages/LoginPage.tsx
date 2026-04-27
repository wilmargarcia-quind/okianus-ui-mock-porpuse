import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── test users ───────────────────────────────────────────────────────────────

const TEST_USERS = [
  { group: 'Administración',
    users: [
      { label: 'Wilmer Hernández',  email: 'admin@okianus.com',      role: 'Admin'    },
    ]
  },
  { group: 'Operadores',
    users: [
      { label: 'Carlos Mendoza',    email: 'operador@okianus.com',   role: 'Operador' },
      { label: 'Ana Rojas',         email: 'operador2@okianus.com',  role: 'Operador' },
    ]
  },
  { group: 'Clientes',
    users: [
      { label: 'BioEnergía S.A.',         email: 'bioe@cliente.com',       role: 'Cliente' },
      { label: 'PetroAndina Ltda.',        email: 'petro@cliente.com',      role: 'Cliente' },
      { label: 'Palmas del Norte',         email: 'palmas@cliente.com',     role: 'Cliente' },
      { label: 'Combustibles del Caribe',  email: 'combus@cliente.com',     role: 'Cliente' },
      { label: 'Refinería Costa',          email: 'refineria@cliente.com',  role: 'Cliente' },
    ]
  },
]

const ROLE_COLOR: Record<string, string> = {
  Admin:    'bg-[#1E88E5]',
  Operador: 'bg-emerald-600',
  Cliente:  'bg-[#5C7391]',
}

// ─── component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [isLoading, setIsLoading]         = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const selectedUser = TEST_USERS.flatMap(g => g.users).find(u => u.email === selectedEmail)

  async function handleLogin() {
    if (!selectedEmail) return
    setIsLoading(true)
    const passwords: Record<string, string> = {
      'admin@okianus.com':      'admin123',
      'operador@okianus.com':   'op123',
      'operador2@okianus.com':  'op123',
      'bioe@cliente.com':       'cli123',
      'petro@cliente.com':      'cli123',
      'palmas@cliente.com':     'cli123',
      'combus@cliente.com':     'cli123',
      'refineria@cliente.com':  'cli123',
    }
    await login(selectedEmail, passwords[selectedEmail] ?? '')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#0A1628] lg:flex">

        {/* hex grid */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hex" x="0" y="0" width="20" height="23" patternUnits="userSpaceOnUse">
                <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77"
                  fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
        </div>

        {/* glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1E88E5]/10 blur-3xl" />

        {/* content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] shadow-2xl shadow-[#1E88E5]/30">
            <Ship className="h-14 w-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">Okianus</h1>
          <p className="mt-2 text-xl font-light text-white/60">Terminals</p>
          <div className="mt-8 h-px w-16 bg-[#1E88E5]/50" />
          <p className="mt-6 text-sm text-white/40 leading-relaxed max-w-xs">
            Terminal de Granel Líquido<br />Zona Franca Cartagena
          </p>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 opacity-10">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
            <path fill="white"
              d="M0,60L60,65C120,70,240,80,360,75C480,70,600,50,720,50C840,50,960,70,1080,72.5C1200,75,1320,60,1380,52.5L1440,45L1440,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-8 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm space-y-8">

          {/* mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628]">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0D2137]">Okianus Terminals</span>
          </div>

          {/* heading */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E88E5]">Demo</p>
            <h2 className="mt-1 text-3xl font-bold text-[#0D2137]">Acceso rápido</h2>
            <p className="mt-1.5 text-sm text-[#5C7391]">
              Elige un usuario para explorar la plataforma
            </p>
          </div>

          {/* user select */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5C7391]">
              <Zap className="h-3.5 w-3.5 text-[#1E88E5]" />
              Selecciona un usuario
            </div>

            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger className="h-12 border-[#E0E7EF] bg-white text-[#0D2137] text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]">
                <SelectValue placeholder="Elige un perfil de acceso…" />
              </SelectTrigger>
              <SelectContent>
                {TEST_USERS.map(group => (
                  <SelectGroup key={group.group}>
                    <SelectLabel className="text-[11px] uppercase tracking-wider text-[#9BAEC8]">
                      {group.group}
                    </SelectLabel>
                    {group.users.map(u => (
                      <SelectItem key={u.email} value={u.email}>
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${ROLE_COLOR[u.role]}`}>
                            {u.label[0]}
                          </span>
                          <span className="text-[#0D2137]">{u.label}</span>
                          <span className="ml-auto text-[11px] text-[#9BAEC8]">{u.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {/* selected user preview */}
            {selectedUser && (
              <div className="flex items-center gap-3 rounded-xl border border-[#E0E7EF] bg-[#F8FAFC] px-4 py-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${ROLE_COLOR[selectedUser.role]}`}>
                  {selectedUser.label[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0D2137]">{selectedUser.label}</p>
                  <p className="text-xs text-[#5C7391]">{selectedUser.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${ROLE_COLOR[selectedUser.role]}`}>
                  {selectedUser.role}
                </span>
              </div>
            )}
          </div>

          {/* login button */}
          <Button
            onClick={handleLogin}
            disabled={!selectedEmail || isLoading}
            className="h-12 w-full bg-[#0D2137] text-white hover:bg-[#1A3A5C] disabled:opacity-40"
          >
            {isLoading ? (
              <><Spinner className="mr-2 h-4 w-4" />Entrando…</>
            ) : (
              <><ChevronRight className="mr-2 h-4 w-4" />Ingresar</>
            )}
          </Button>

          <p className="text-center text-xs text-[#9BAEC8]">
            Okianus S.A.S. © 2026 · Zona Franca Cartagena
          </p>
        </div>
      </div>
    </div>
  )
}
