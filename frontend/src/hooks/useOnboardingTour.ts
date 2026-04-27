import { useCallback } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAuth } from '@/contexts/AuthContext'

const STORAGE_KEY = 'okianus_tour_v2_'

// ─── Accordion helper ─────────────────────────────────────────────────────────
// Opens a sidebar accordion section (Radix Collapsible) if currently closed.
// Returns true if a click was needed (i.e. the section was closed).
function ensureOpen(triggerId: string): boolean {
  const btn = document.getElementById(triggerId)
  if (!btn) return false
  if (btn.getAttribute('data-state') !== 'open') {
    btn.click()
    return true
  }
  return false
}

// ─── Tour step definitions per role ──────────────────────────────────────────

const CLIENT_STEPS = [
  {
    popover: {
      title: '👋 Bienvenido a tu portal Okianus',
      description:
        'Este es tu espacio personal para consultar inventario, seguir tus vehículos en planta y descargar reportes. Te guiamos en 2 minutos.',
    },
  },
  {
    element: 'a[href="/client/inventory"]',
    popover: {
      title: '📦 Mi Inventario',
      description:
        'Consulta tus saldos por producto y calidad. Ves la evolución de los últimos 14 días y el detalle de cada movimiento.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#tour-hero',
    popover: {
      title: '💰 Tu saldo total en planta',
      description:
        'Toneladas totales almacenadas en el terminal en este momento, con la variación de la última semana.',
      side: 'bottom' as const,
    },
  },
  {
    element: '#tour-allocations',
    popover: {
      title: '📊 Composición por producto',
      description:
        'Cada tarjeta muestra el saldo, porcentaje del total y tendencia reciente de cada producto/calidad que tienes en custodia.',
      side: 'bottom' as const,
    },
  },
  {
    element: '#tour-chart',
    popover: {
      title: '📈 Evolución de inventario',
      description:
        'El gráfico muestra cómo ha variado tu balance durante los últimos 14 días con entradas y salidas acumuladas.',
      side: 'top' as const,
    },
  },
  {
    element: '#tour-movements',
    popover: {
      title: '📋 Últimos movimientos',
      description:
        'Registro detallado de cada entrada, salida y ajuste: fecha, hora, toneladas y saldo resultante después de cada operación.',
      side: 'top' as const,
    },
  },
  {
    element: 'a[href="/client/vehicles"]',
    popover: {
      title: '🚛 Mis Vehículos',
      description:
        'Seguimiento en tiempo real de tus camiones en planta. Puedes ver en qué fase del ciclo está cada vehículo: registro, patio, pesaje, bahía o completado.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/client/reports"]',
    popover: {
      title: '📄 Mis Reportes',
      description:
        'Descarga reportes de movimientos e inventario en PDF o Excel. Filtra por fecha, producto o tipo de movimiento.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: '✅ ¡Todo listo!',
      description:
        'Ya conoces tu portal. Puedes relanzar esta guía en cualquier momento usando el botón <strong>"Guía rápida"</strong> en la parte superior de la página.',
    },
  },
]

const OPERATOR_STEPS = [
  {
    popover: {
      title: '⚙️ Panel del Operador — Okianus',
      description:
        'Tienes control sobre el ciclo operativo completo: desde el ingreso del camión hasta su salida autorizada. Repasamos cada estación del menú.',
    },
  },
  // ── Conductores & Turnos ──
  {
    element: '#tour-nav-conductores',
    popover: {
      title: '🚛 Conductores & Turnos',
      description:
        'Esta sección cubre las dos primeras etapas del ciclo: el registro del conductor y la gestión del turno de atención.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/drivers"]',
    popover: {
      title: '📋 Pre-registro & RUNT',
      description:
        'Registra la llegada del conductor, valida su cédula contra el RUNT en tiempo real y asigna el turno de atención.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/turnos"]',
    popover: {
      title: '🔄 Asignación de Turnos',
      description:
        'Vista de todos los turnos activos. Confirma el turno para que el camión pase al patio. Alerta automática si lleva más de 45 min esperando.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  // ── Ciclo en Planta ──
  {
    element: '#tour-nav-ciclo',
    popover: {
      title: '🏭 Ciclo en Planta',
      description:
        'Las tres estaciones restantes del ciclo: Patio, Pesaje y Bahía. Cada una debe completarse en secuencia antes de autorizar la salida.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/patio"]',
    popover: {
      title: '🔍 Patio & Checklist',
      description:
        'Ejecuta el checklist de ingreso de 12 ítems (conductor, vehículo, documentos, seguridad) y registra el resultado de la muestra de laboratorio.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/pesaje"]',
    popover: {
      title: '⚖️ Pesaje Sicompas',
      description:
        'Registra el peso inicial (camión vacío o lleno) y el peso final tras la operación. El sistema calcula el peso neto automáticamente.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/bahia"]',
    popover: {
      title: '⚓ Bahía & Salida',
      description:
        'Monitorea el cargue/descargue en bahía, genera la orden de salida y autoriza al vehículo una vez completada la operación.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: '✅ ¡Listo para operar!',
      description:
        'Cada acción que realices actualiza el estado en tiempo real y el cliente puede verlo en su portal al instante.',
    },
  },
]

const ADMIN_STEPS = [
  {
    popover: {
      title: '🏭 Panel Administrador — Okianus Terminals',
      description:
        'Tienes acceso completo al sistema: ciclo operativo, inventario, reportes y configuración. Recorremos cada sección del menú.',
    },
  },
  {
    element: 'a[href="/dashboard"]',
    popover: {
      title: '📊 Panel Principal',
      description:
        'Vista ejecutiva: estado del ciclo en vivo, KPIs de inventario, gráfico de movimientos de 30 días, saldo por cliente y últimas transacciones.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  // ── Ciclo operativo ──
  {
    element: '#tour-nav-conductores',
    popover: {
      title: '🔄 Conductores & Turnos',
      description:
        'Gestión de llegadas, validación RUNT y asignación de turnos. Primera estación del ciclo operativo.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/drivers"]',
    popover: {
      title: '📋 Pre-registro & RUNT',
      description:
        'Registro de conductores y validación de documentos en tiempo real contra la base del RUNT.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/turnos"]',
    popover: {
      title: '🔄 Asignación de Turnos',
      description:
        'Control de turnos activos con alertas automáticas por tiempos de espera excedidos.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#tour-nav-ciclo',
    popover: {
      title: '🏭 Ciclo en Planta',
      description:
        'Las tres estaciones del ciclo físico dentro del terminal: Patio, Pesaje y Bahía.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/patio"]',
    popover: {
      title: '🔍 Patio & Checklist',
      description:
        'Checklist de 12 ítems y resultado de muestra de laboratorio. Determina si el camión continúa o es rechazado.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/pesaje"]',
    popover: {
      title: '⚖️ Pesaje Sicompas',
      description:
        'Registro de peso inicial y final. El peso neto se calcula automáticamente y genera el movimiento de inventario.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/operation/bahia"]',
    popover: {
      title: '⚓ Bahía & Salida',
      description:
        'Cargue/descargue en bahía, generación de orden de salida y autorización final del vehículo.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  // ── Inventario & Reportes ──
  {
    element: 'a[href="/inventory"]',
    popover: {
      title: '📦 Gestión de Inventario',
      description:
        'Inventario multi-cliente: saldos por cliente, producto y calidad. Los pesajes generan movimientos automáticos.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/reports"]',
    popover: {
      title: '📄 Reportes Automáticos',
      description:
        'Generación de reportes de operaciones, movimientos e inventario. Exportables en PDF y Excel. Solo visible para Administrador.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  // ── Configuración ──
  {
    element: '#tour-nav-admin',
    popover: {
      title: '⚙️ Administración',
      description:
        'Configuración completa del sistema: clientes, productos, tanques, usuarios y participación. Cada módulo a continuación.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/admin/clients"]',
    popover: {
      title: '🏢 Clientes',
      description:
        'Registra y gestiona las empresas que operan en el terminal. Activa o desactiva clientes sin afectar el historial de movimientos.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/admin/products"]',
    popover: {
      title: '📦 Productos y Calidades',
      description:
        'Define los productos almacenados (Aceite de Palma, GLP, etc.) y sus calidades. Cada calidad tiene parámetros de laboratorio propios.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/admin/tanks"]',
    popover: {
      title: '🗄️ Tanques',
      description:
        'Referencia de los tanques físicos del terminal: capacidad y estado (activo, mantenimiento, inactivo). El inventario se gestiona por cliente/calidad.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/admin/users"]',
    popover: {
      title: '👤 Usuarios',
      description:
        'Gestión de cuentas de acceso: Administradores, Operadores y Clientes. Asigna roles y asocia usuarios de tipo Cliente a su empresa.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: 'a[href="/admin/participation"]',
    popover: {
      title: '📊 % Participación',
      description:
        'Configura el porcentaje de participación de cada cliente por producto, las bahías asignadas y el SLA de atención en horas.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: '✅ ¡Listo!',
      description:
        'Para cambiar de rol de prueba usa el selector en la parte inferior del menú lateral. Puedes ver el sistema como Operador o como Cliente.',
    },
  },
]

const TOUR_STEPS_BY_ROLE: Record<string, typeof CLIENT_STEPS> = {
  CLIENT:   CLIENT_STEPS,
  OPERATOR: OPERATOR_STEPS,
  ADMIN:    ADMIN_STEPS,
}

// ─── IDs de acordeones que necesita cada rol ──────────────────────────────────
const ACCORDIONS_BY_ROLE: Record<string, string[]> = {
  OPERATOR: ['tour-nav-conductores', 'tour-nav-ciclo'],
  ADMIN:    ['tour-nav-conductores', 'tour-nav-ciclo', 'tour-nav-admin'],
  CLIENT:   [],
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboardingTour() {
  const { user } = useAuth()

  const startTour = useCallback(() => {
    if (!user) return
    const steps    = TOUR_STEPS_BY_ROLE[user.role] ?? CLIENT_STEPS
    const sections = ACCORDIONS_BY_ROLE[user.role]  ?? []

    // Open all required accordion sections so their sub-links exist in the DOM
    let anyOpened = false
    for (const id of sections) {
      if (ensureOpen(id)) anyOpened = true
    }

    // If any accordion was opened, wait for Radix animation (~200 ms) before driving
    const delay = anyOpened ? 280 : 0

    setTimeout(() => {
      const d = driver({
        showProgress: true,
        progressText: '{{current}} de {{total}}',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Anterior',
        doneBtnText: '¡Entendido!',
        steps,
        popoverClass: 'okianus-tour-popover',
        onDestroyStarted: () => {
          localStorage.setItem(STORAGE_KEY + user.role, 'done')
          d.destroy()
        },
      })
      d.drive()
    }, delay)
  }, [user])

  const isFirstVisit = user
    ? !localStorage.getItem(STORAGE_KEY + user.role)
    : false

  const markDone = useCallback(() => {
    if (user) localStorage.setItem(STORAGE_KEY + user.role, 'done')
  }, [user])

  const resetTour = useCallback(() => {
    if (user) localStorage.removeItem(STORAGE_KEY + user.role)
  }, [user])

  return { startTour, isFirstVisit, markDone, resetTour }
}
