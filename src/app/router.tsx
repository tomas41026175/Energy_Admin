import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/auth/auth.guard'
import { AppLayout } from '@/app/layout/AppLayout'
import { Spinner } from '@/shared/ui/Spinner'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const UsersPage = lazy(() => import('@/pages/users'))

const suspenseFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" className="text-blue-600" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={suspenseFallback}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={suspenseFallback}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/users',
            element: (
              <Suspense fallback={suspenseFallback}>
                <UsersPage />
              </Suspense>
            ),
          },
          // Authenticated users hitting unknown paths → /dashboard
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // Unauthenticated users → AuthGuard redirects to /login
  { path: '*', element: <Navigate to="/login" replace /> },
])
