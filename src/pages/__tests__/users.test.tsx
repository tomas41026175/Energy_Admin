import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/shared/ui/Toast'

vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}))
vi.mock('@/domains/users/UsersTable', () => ({
  UsersTable: ({ params, searchQuery }: { params: Record<string, unknown>; searchQuery?: string }) => (
    <div
      role="region"
      aria-label="users-table"
      data-params={JSON.stringify(params)}
      data-search-query={searchQuery ?? ''}
    >
      UsersTable
    </div>
  ),
}))

const { default: UsersPage } = await import('../users')

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true }

const renderUsers = (initialSearch = '') =>
  render(
    <MemoryRouter future={ROUTER_FUTURE} initialEntries={[`/users${initialSearch}`]}>
      <ToastProvider>
        <UsersPage />
      </ToastProvider>
    </MemoryRouter>,
  )

const getTable = () => {
  const el = screen.getByRole('region', { name: 'users-table' })
  return JSON.parse((el as HTMLElement).dataset.params ?? '{}') as Record<string, unknown>
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading', () => {
    renderUsers()
    expect(screen.getByRole('heading', { name: /使用者管理/i })).toBeInTheDocument()
  })

  it('renders skip to main content link', () => {
    renderUsers()
    expect(screen.getByText('跳至主要內容')).toBeInTheDocument()
  })

  it('renders unified search input', () => {
    renderUsers()
    expect(screen.getByRole('textbox', { name: /搜尋使用者/i })).toBeInTheDocument()
  })

  it('renders status filter select', () => {
    renderUsers()
    expect(screen.getByRole('combobox', { name: /狀態篩選/i })).toBeInTheDocument()
  })

  it('renders page size select', () => {
    renderUsers()
    expect(screen.getByRole('combobox', { name: /每頁筆數/i })).toBeInTheDocument()
  })

  it('renders UsersTable component', () => {
    renderUsers()
    expect(screen.getByRole('region', { name: 'users-table' })).toBeInTheDocument()
  })

  it('passes initial page=1 to UsersTable', () => {
    renderUsers()
    expect(getTable().page).toBe(1)
  })

  it('passes default limit=10 to UsersTable', () => {
    renderUsers()
    expect(getTable().limit).toBe(10)
  })

  it('routes to name param when input has no @', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('textbox', { name: /搜尋使用者/i }), {
      target: { value: 'alice' },
    })
    const params = getTable()
    expect(params.name).toBe('alice')
    expect(params.email).toBeUndefined()
  })

  it('routes to email param when input contains @', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('textbox', { name: /搜尋使用者/i }), {
      target: { value: 'alice@example.com' },
    })
    const params = getTable()
    expect(params.email).toBe('alice@example.com')
    expect(params.name).toBeUndefined()
  })

  it('passes status filter when select changes', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('combobox', { name: /狀態篩選/i }), {
      target: { value: 'active' },
    })
    expect(getTable().status).toBe('active')
  })

  it('resets page to 1 when search input changes', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('textbox', { name: /搜尋使用者/i }), {
      target: { value: 'bob' },
    })
    expect(getTable().page).toBe(1)
  })

  it('does not include name or email when search is empty', () => {
    renderUsers()
    const params = getTable()
    expect(params.name).toBeUndefined()
    expect(params.email).toBeUndefined()
  })

  it('shows clear button when search input has value', () => {
    renderUsers()
    const input = screen.getByRole('textbox', { name: /搜尋使用者/i })
    fireEvent.change(input, { target: { value: 'alice' } })
    expect(screen.getByRole('button', { name: /清除搜尋/i })).toBeInTheDocument()
  })

  it('does not show clear button when search is empty', () => {
    renderUsers()
    expect(screen.queryByRole('button', { name: /清除搜尋/i })).not.toBeInTheDocument()
  })

  it('clears search input when clear button is clicked', () => {
    renderUsers()
    const input = screen.getByRole('textbox', { name: /搜尋使用者/i })
    fireEvent.change(input, { target: { value: 'alice' } })
    fireEvent.click(screen.getByRole('button', { name: /清除搜尋/i }))
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('changes page size when limit select changes', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('combobox', { name: /每頁筆數/i }), {
      target: { value: '25' },
    })
    expect(getTable().limit).toBe(25)
  })

  it('passes searchQuery prop to UsersTable', () => {
    renderUsers()
    fireEvent.change(screen.getByRole('textbox', { name: /搜尋使用者/i }), {
      target: { value: 'test' },
    })
    const el = screen.getByRole('region', { name: 'users-table' })
    expect((el as HTMLElement).dataset.searchQuery).toBe('test')
  })
})
