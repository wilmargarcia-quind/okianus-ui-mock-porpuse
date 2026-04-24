import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@/types'
import { mockUsers } from '@/data/mockData'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: 'ADMIN' | 'OPERATOR' | 'CLIENT') => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'okianus_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed.user)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + Date.now(),
      }))
      return true
    }
    
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const switchRole = (role: 'ADMIN' | 'OPERATOR' | 'CLIENT') => {
    // Pick a representative user for each role
    const roleUserMap: Record<string, string> = {
      ADMIN: 'admin@okianus.com',
      OPERATOR: 'operador@okianus.com',
      CLIENT: 'bioenergia@cliente.com',
    }
    const target = mockUsers.find(u => u.email === roleUserMap[role])
    if (!target) return
    const { password: _, ...userWithoutPassword } = target
    setUser(userWithoutPassword)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Date.now(),
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
