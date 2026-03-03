import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { Spinner } from '@/shared/ui/Spinner'

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
