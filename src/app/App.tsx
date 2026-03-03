import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers'
import { router } from './router'
import { useAuthStore } from '@/auth/auth.store'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

// useEffect is allowed here: one-time app initialization side effect
const SessionRestore = () => {
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  return null
}

const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <SessionRestore />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AppProviders>
  </ErrorBoundary>
)

export default App
