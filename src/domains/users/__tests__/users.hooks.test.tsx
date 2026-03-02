import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useUsers } from '../users.hooks'
import type { ReactNode } from 'react'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return Wrapper
}

describe('useUsers', () => {
  it('should start with loading state', () => {
    server.use(
      http.get(`${API_BASE}/api/users`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({
          data: [],
          pagination: { total: 0, current_page: 1, per_page: 10, total_pages: 0 },
        })
      }),
    )

    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return data on success', async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, () => {
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Test', email: 'test@test.com', avatar: '', status: 'active', created_at: '2026-01-01' },
          ],
          pagination: { total: 1, current_page: 1, per_page: 10, total_pages: 1 },
        })
      }),
    )

    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].name).toBe('Test')
  })

  it('should return error on failure', async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      }),
    )

    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })
})
