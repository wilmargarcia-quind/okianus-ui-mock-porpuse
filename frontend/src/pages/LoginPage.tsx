import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Ship, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const success = await login(data.email, data.password)
      if (success) {
        navigate('/')
      } else {
        setError('Credenciales inválidas. Por favor verifica tu email y contraseña.')
      }
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#0D2137] p-12 lg:flex">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="20" height="23" patternUnits="userSpaceOnUse">
                <polygon
                  points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Logo and Text */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10">
              <Ship className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Okianus Terminals</h1>
          <p className="text-lg text-white/70">Terminal de Granel Líquido</p>
          <p className="text-white/50">Zona Franca Cartagena</p>
        </div>

        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
          <svg viewBox="0 0 1440 320" className="h-full w-full" preserveAspectRatio="none">
            <path
              fill="currentColor"
              className="text-white"
              d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center bg-white px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0D2137]">
              <Ship className="h-7 w-7 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0D2137]">Okianus</span>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold text-[#0D2137]">Bienvenido</h2>
            <p className="text-[#5C7391]">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0D2137]">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
                className={`h-12 border-[#E0E7EF] bg-white text-[#0D2137] placeholder:text-[#9BAEC8] focus:border-[#1E88E5] focus:ring-[#1E88E5] ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0D2137]">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`h-12 border-[#E0E7EF] bg-white pr-12 text-[#0D2137] placeholder:text-[#9BAEC8] focus:border-[#1E88E5] focus:ring-[#1E88E5] ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9BAEC8] hover:text-[#5C7391]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-[#0D2137] text-white hover:bg-[#1A3A5C]"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-lg border border-[#E0E7EF] bg-[#F8FAFC] p-4">
            <p className="mb-3 text-sm font-medium text-[#0D2137]">Credenciales de prueba:</p>
            <div className="space-y-2 text-xs text-[#5C7391]">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span>admin@okianus.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Operador:</span>
                <span>operador@okianus.com / op123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cliente:</span>
                <span>bioenergia@cliente.com / cli123</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#9BAEC8]">
            <p>Okianus S.A.S. © 2026 · Zona Franca Cartagena</p>
          </div>
        </div>
      </div>
    </div>
  )
}
