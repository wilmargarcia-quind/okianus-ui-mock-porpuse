import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import LoginPage from '@/pages/LoginPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import MovementsPage from '@/pages/MovementsPage'
import ReportsPage from '@/pages/ReportsPage'
import ClientsPage from '@/pages/admin/ClientsPage'
import ProductsPage from '@/pages/admin/ProductsPage'
import TanksPage from '@/pages/admin/TanksPage'
import UsersPage from '@/pages/admin/UsersPage'
import ClientInventoryPage from '@/pages/client/ClientInventoryPage'
import ClientReportsPage from '@/pages/client/ClientReportsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'CLIENT') {
      return <Navigate to="/client/inventory" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (user?.role === 'CLIENT') {
      return <Navigate to="/client/inventory" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Admin & Operator Routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'OPERATOR']}>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'OPERATOR']}>
              <InventoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="movements"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'OPERATOR']}>
              <MovementsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="reports"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'OPERATOR']}>
              <ReportsPage />
            </PrivateRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route path="admin" element={<Navigate to="/admin/clients" replace />} />
        <Route
          path="admin/clients"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ClientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/products"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ProductsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/tanks"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <TanksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </PrivateRoute>
          }
        />

        {/* Client Routes */}
        <Route
          path="client/inventory"
          element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <ClientInventoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="client/reports"
          element={
            <PrivateRoute allowedRoles={['CLIENT']}>
              <ClientReportsPage />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
