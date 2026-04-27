import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FloatingChat from './FloatingChat'
import { OperationalProvider } from '@/contexts/OperationalContext'
import { useOnboardingTour } from '@/hooks/useOnboardingTour'

// Fires the tour once per role on first login, after a short delay so the
// page finishes rendering and all DOM elements the tour targets are mounted.
function OnboardingAutoStart() {
  const { isFirstVisit, startTour, markDone } = useOnboardingTour()

  useEffect(() => {
    if (!isFirstVisit) return
    markDone() // mark before starting so a page refresh won't re-trigger
    const timer = setTimeout(() => startTour(), 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  return null
}

export default function DashboardLayout() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <OperationalProvider>
      <OnboardingAutoStart />
      <FloatingChat />
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </OperationalProvider>
  )
}
