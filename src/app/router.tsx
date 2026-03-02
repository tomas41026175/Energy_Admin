import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/auth/auth.guard'

const LoginPage = lazy(() => import('@/pages/login'))
const UsersPage = lazy(() => import('@/pages/users'))

const suspenseFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-gray-500">Loading...</div>
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
        path: '/users',
        element: (
          <Suspense fallback={suspenseFallback}>
            <UsersPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
