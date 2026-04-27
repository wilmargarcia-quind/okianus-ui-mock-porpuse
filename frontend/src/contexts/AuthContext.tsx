import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { mockUsers } from '@/data/mockData'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: 'ADMIN' | 'OPERATOR' | 'CLIENT') => void
  switchUser: (email: string) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'okianus_auth'

function persist(user: User) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    user,
    token: 'mock-jwt-token-' + Date.now(),
  }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored).user) } catch { localStorage.removeItem(AUTH_STORAGE_KEY) }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (found) {
      const { password: _, ...u } = found
      setUser(u); persist(u); return true
    }
    return false
  }

  const logout = () => { setUser(null); localStorage.removeItem(AUTH_STORAGE_KEY) }

  /** Switch to any mock user by email */
  const switchUser = (email: string) => {
    const found = mockUsers.find(u => u.email === email)
    if (!found) return
    const { password: _, ...u } = found
    setUser(u); persist(u)
  }

  /** Switch to the canonical user for a given role */
  const switchRole = (role: 'ADMIN' | 'OPERATOR' | 'CLIENT') => {
    const map: Record<string, string> = {
      ADMIN:    'admin@okianus.com',
      OPERATOR: 'operador@okianus.com',
      CLIENT:   'bioe@cliente.com',
    }
    switchUser(map[role])
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole, switchUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
