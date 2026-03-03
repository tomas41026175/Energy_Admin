import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/shared/ui/Toast'
import { QUERY_STALE_TIME } from '@/shared/constants'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      retry: 1,
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>{children}</ToastProvider>
  </QueryClientProvider>
)
