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

// useEffect allowed here: 全域 unhandled rejection 監聽，非 Query 可取代的副作用
const GlobalErrorListener = () => {
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent): void => {
      // Production: 可整合 Sentry 等錯誤追蹤服務
      // eslint-disable-next-line no-console
      console.warn('[UnhandledRejection]', e.reason)
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return null
}

const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <GlobalErrorListener />
      <SessionRestore />
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AppProviders>
  </ErrorBoundary>
)

export default App
