import { Link } from 'react-router-dom'
import { Ship, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F6FA] px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0D2137]">
            <Ship className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-6xl font-bold text-[#0D2137]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-[#5C7391]">Página no encontrada</h2>
        <p className="mb-8 max-w-md text-[#9BAEC8]">
          Lo sentimos, la página que buscas no existe o ha sido movida. Verifica la dirección o
          regresa al inicio.
        </p>

        <Button asChild className="bg-[#0D2137] hover:bg-[#1A3A5C]">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Link>
        </Button>
      </div>

      <p className="absolute bottom-8 text-sm text-[#9BAEC8]">
        Okianus S.A.S. © 2026 · Zona Franca Cartagena
      </p>
    </div>
  )
}
