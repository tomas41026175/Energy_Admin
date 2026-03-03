import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UsersTable } from '../UsersTable'
import { useUsers } from '../users.hooks'

vi.mock('../users.hooks')

const mockUseUsers = vi.mocked(useUsers)

const mockPagination = {
  total: 2,
  current_page: 1,
  per_page: 10,
  total_pages: 1,
}

const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com', avatar: '', status: 'active' as const, created_at: '2026-01-01' },
  { id: 2, name: 'Bob', email: 'bob@test.com', avatar: '', status: 'inactive' as const, created_at: '2026-01-02' },
]

const defaultHookResult = {
  data: { data: mockUsers, pagination: mockPagination },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  isPlaceholderData: false,
} as unknown as ReturnType<typeof useUsers>

describe('UsersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows skeleton while loading', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Loading users')).toBeInTheDocument()
  })

  it('shows error message on failure', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows default error message when error has no message', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: undefined,
      isLoading: false,
      isError: true,
      error: {} as Error,
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load users')).toBeInTheDocument()
  })

  it('shows empty state when no users', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: { data: [], pagination: { ...mockPagination, total: 0 } },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('renders user data in table', () => {
    mockUseUsers.mockReturnValue(defaultHookResult)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getAllByText('Alice')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Bob')[0]).toBeInTheDocument()
  })

  it('shows retry button in error state and calls refetch', () => {
    const refetch = vi.fn()
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      isError: true,
      error: new Error('Oops'),
      refetch,
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('renders active status badge', () => {
    mockUseUsers.mockReturnValue(defaultHookResult)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getAllByText('active').length).toBeGreaterThan(0)
  })

  it('reduces opacity when isPlaceholderData', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      isPlaceholderData: true,
    } as unknown as ReturnType<typeof useUsers>)

    const { container } = render(
      <UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />,
    )
    expect(container.firstChild).toHaveClass('opacity-60')
  })

  it('does not show pagination when totalPages is 1', () => {
    mockUseUsers.mockReturnValue(defaultHookResult)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument()
  })

  it('shows pagination when totalPages > 1', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, total_pages: 3, total: 30 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
  })

  it('calls onPageChange when Next button clicked', () => {
    const onPageChange = vi.fn()
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 1, total_pages: 3 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Previous button on first page', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 1, total_pages: 3 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 1, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('shows ellipsis for large page count (current near start)', () => {
    // total_pages > 7, current <= 4 → [1,2,3,4,5,...,20]
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 2, total_pages: 20, total: 200 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 2, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
    // Ellipsis buttons should appear (disabled buttons with '...')
    const ellipsisButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent === '...',
    )
    expect(ellipsisButtons.length).toBeGreaterThan(0)
  })

  it('shows ellipsis for large page count (current near end)', () => {
    // total_pages > 7, current >= total - 3 → [1,...,16,17,18,19,20]
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 18, total_pages: 20, total: 200 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 18, limit: 10 }} onPageChange={vi.fn()} />)
    const ellipsisButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent === '...',
    )
    expect(ellipsisButtons.length).toBeGreaterThan(0)
  })

  it('shows ellipsis on both sides for middle page (current in middle)', () => {
    // total_pages > 7, current = 10 → [1,...,9,10,11,...,20]
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 10, total_pages: 20, total: 200 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 10, limit: 10 }} onPageChange={vi.fn()} />)
    const ellipsisButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent === '...',
    )
    expect(ellipsisButtons.length).toBe(2)
  })

  it('disables Next button on last page', () => {
    mockUseUsers.mockReturnValue({
      ...defaultHookResult,
      data: {
        data: mockUsers,
        pagination: { ...mockPagination, current_page: 3, total_pages: 3 },
      },
    } as unknown as ReturnType<typeof useUsers>)

    render(<UsersTable params={{ page: 3, limit: 10 }} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})
