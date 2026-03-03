import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const makeUsersResponse = (total: number, users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', avatar: '', status: 'active', created_at: '2026-01-01' },
  { id: 2, name: 'Bob', email: 'bob@example.com', avatar: '', status: 'inactive', created_at: '2026-01-02' },
]) => ({
  data: users,
  pagination: { total, current_page: 1, per_page: 5, total_pages: 1 },
})

const server = setupServer(
  // total users
  http.get(`${API_BASE}/api/users`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = url.searchParams.get('limit')

    if (status === 'active') {
      return HttpResponse.json(makeUsersResponse(30, [
        { id: 1, name: 'Alice', email: 'alice@example.com', avatar: '', status: 'active' as const, created_at: '2026-01-01' },
      ]))
    }
    if (status === 'inactive') {
      return HttpResponse.json(makeUsersResponse(20, [
        { id: 2, name: 'Bob', email: 'bob@example.com', avatar: '', status: 'inactive' as const, created_at: '2026-01-02' },
      ]))
    }
    // Recent 5 users (limit=5) or total query
    if (limit === '5') {
      return HttpResponse.json(makeUsersResponse(50, [
        { id: 1, name: 'Alice', email: 'alice@example.com', avatar: '', status: 'active' as const, created_at: '2026-01-01' },
        { id: 2, name: 'Bob', email: 'bob@example.com', avatar: '', status: 'inactive' as const, created_at: '2026-01-02' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', avatar: '', status: 'active' as const, created_at: '2026-01-03' },
        { id: 4, name: 'Diana', email: 'diana@example.com', avatar: '', status: 'active' as const, created_at: '2026-01-04' },
        { id: 5, name: 'Eve', email: 'eve@example.com', avatar: '', status: 'inactive' as const, created_at: '2026-01-05' },
      ]))
    }
    return HttpResponse.json(makeUsersResponse(50))
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
  return Wrapper
}

const { default: DashboardPage } = await import('../dashboard')

const renderDashboard = () =>
  render(<DashboardPage />, { wrapper: createWrapper() })

describe('DashboardPage', () => {
  it('shows skeleton loading state initially (3 stat cards loading)', () => {
    renderDashboard()
    // Skeletons are aria-hidden, but the loading state should show loading indicators
    const skeletons = document.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })

  it('displays total users count after loading', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  it('displays active users count after loading', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })

  it('displays inactive users count after loading', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument()
    })
  })

  it('shows stat card labels', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('總使用者')).toBeInTheDocument()
      // Use getAllByText to handle duplicates (stat label + StatusBadge)
      expect(screen.getAllByText('活躍').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('停用').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows recent users section heading', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/最近使用者/i)).toBeInTheDocument()
    })
  })

  it('shows recent users list (up to 5)', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
      expect(screen.getByText('Eve')).toBeInTheDocument()
    })
  })

  it('shows user email in recent users list', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    })
  })
})
