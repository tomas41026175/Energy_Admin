import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
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

  return { Wrapper, queryClient }
}

describe('useUsers', () => {
  it('should start with loading state', async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({
          data: [],
          pagination: { total: 0, current_page: 1, per_page: 10, total_pages: 0 },
        })
      }),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: Wrapper,
    })

    expect(result.current.isLoading).toBe(true)
    // Wait for request to complete before afterEach resets MSW handlers,
    // preventing "Cannot bypass a request" error from in-flight requests
    await waitFor(() => expect(result.current.isLoading).toBe(false))
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

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: Wrapper,
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

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })

  it('should prefetch next page when current page data loads', async () => {
    let requestCount = 0
    server.use(
      http.get(`${API_BASE}/api/users`, ({ request }) => {
        requestCount++
        const url = new URL(request.url)
        const page = url.searchParams.get('page') ?? '1'
        return HttpResponse.json({
          data: [
            { id: 1, name: 'Test', email: 'test@test.com', avatar: '', status: 'active', created_at: '2026-01-01' },
          ],
          pagination: { total: 20, current_page: Number(page), per_page: 10, total_pages: 2 },
        })
      }),
    )

    const { Wrapper, queryClient } = createWrapper()
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery')

    renderHook(() => useUsers({ page: 1, limit: 10 }), { wrapper: Wrapper })

    // 等待主查詢完成
    await waitFor(() => expect(requestCount).toBeGreaterThanOrEqual(1))

    // prefetchQuery 應被呼叫以預取下一頁
    await waitFor(() => expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining([expect.objectContaining({ page: 2 })]),
      })
    ))
  })
})
