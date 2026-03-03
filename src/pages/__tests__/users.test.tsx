import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '@/auth/auth.store'
import { ToastProvider } from '@/shared/ui/Toast'

vi.mock('@/auth/auth.store')
vi.mock('@/shared/hooks/useDebounce', () => ({
  // Return value immediately (no delay) to test debounced branches in coverage
  useDebounce: (value: unknown) => value,
}))
vi.mock('@/domains/users/UsersTable', () => ({
  UsersTable: ({ params }: { params: Record<string, unknown> }) => (
    <div data-testid="users-table" data-params={JSON.stringify(params)}>
      UsersTable
    </div>
  ),
}))

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockLogout = vi.fn()

const { default: UsersPage } = await import('../users')

const renderUsers = () =>
  render(
    <ToastProvider>
      <UsersPage />
    </ToastProvider>,
  )

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        login: vi.fn(),
        logout: mockLogout,
        user: { username: 'testuser', role: 'admin' },
        isAuthenticated: true,
        isLoading: false,
        restoreSession: vi.fn(),
      }),
    )
  })

  it('renders page heading', () => {
    renderUsers()
    expect(screen.getByRole('heading', { name: /使用者管理/i })).toBeInTheDocument()
  })

  it('renders user username in header', () => {
    renderUsers()
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    renderUsers()
    expect(screen.getByRole('button', { name: /登出/i })).toBeInTheDocument()
  })

  it('renders skip to main content link', () => {
    renderUsers()
    expect(screen.getByText('跳至主要內容')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderUsers()
    expect(screen.getByRole('textbox', { name: /搜尋/i })).toBeInTheDocument()
  })

  it('renders status filter select', () => {
    renderUsers()
    expect(screen.getByRole('combobox', { name: /狀態篩選/i })).toBeInTheDocument()
  })

  it('renders UsersTable component', () => {
    renderUsers()
    expect(screen.getByTestId('users-table')).toBeInTheDocument()
  })

  it('calls logout when logout button clicked', () => {
    renderUsers()
    fireEvent.click(screen.getByRole('button', { name: /登出/i }))
    expect(mockLogout).toHaveBeenCalledOnce()
  })

  it('shows toast notification after logout', async () => {
    renderUsers()
    fireEvent.click(screen.getByRole('button', { name: /登出/i }))
    await waitFor(() => {
      expect(screen.getByText('您已登出。')).toBeInTheDocument()
    })
  })

  it('passes initial page=1 to UsersTable', () => {
    renderUsers()
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.page).toBe(1)
  })

  it('passes name filter when search input changes', () => {
    renderUsers()
    const searchInput = screen.getByRole('textbox', { name: /搜尋/i })
    fireEvent.change(searchInput, { target: { value: 'alice' } })
    expect(searchInput).toHaveValue('alice')
    // useDebounce is mocked to return value immediately
    // so params.name should be set in the next render
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.name).toBe('alice')
  })

  it('passes status filter when select changes', () => {
    renderUsers()
    const select = screen.getByRole('combobox', { name: /狀態篩選/i })
    fireEvent.change(select, { target: { value: 'active' } })
    expect(select).toHaveValue('active')
  })

  it('does not show username when user is null', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        login: vi.fn(),
        logout: mockLogout,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        restoreSession: vi.fn(),
      }),
    )
    renderUsers()
    expect(screen.queryByText('testuser')).not.toBeInTheDocument()
  })
})
