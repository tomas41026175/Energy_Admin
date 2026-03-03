import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ToastProvider } from '@/shared/ui/Toast'

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
  })

  it('renders page heading', () => {
    renderUsers()
    expect(screen.getByRole('heading', { name: /使用者管理/i })).toBeInTheDocument()
  })

  it('renders skip to main content link', () => {
    renderUsers()
    expect(screen.getByText('跳至主要內容')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderUsers()
    expect(screen.getByRole('textbox', { name: /依姓名搜尋/i })).toBeInTheDocument()
  })

  it('renders email search input', () => {
    renderUsers()
    expect(screen.getByRole('textbox', { name: /依 email 搜尋/i })).toBeInTheDocument()
  })

  it('renders ID search input', () => {
    renderUsers()
    expect(screen.getByRole('spinbutton', { name: /依 id 搜尋/i })).toBeInTheDocument()
  })

  it('renders status filter select', () => {
    renderUsers()
    expect(screen.getByRole('combobox', { name: /狀態篩選/i })).toBeInTheDocument()
  })

  it('renders created-from date input', () => {
    renderUsers()
    expect(screen.getByLabelText('建立日期起')).toBeInTheDocument()
  })

  it('renders created-to date input', () => {
    renderUsers()
    expect(screen.getByLabelText('建立日期迄')).toBeInTheDocument()
  })

  it('renders UsersTable component', () => {
    renderUsers()
    expect(screen.getByTestId('users-table')).toBeInTheDocument()
  })

  it('passes initial page=1 to UsersTable', () => {
    renderUsers()
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.page).toBe(1)
  })

  it('passes name filter when search input changes', () => {
    renderUsers()
    const searchInput = screen.getByRole('textbox', { name: /依姓名搜尋/i })
    fireEvent.change(searchInput, { target: { value: 'alice' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.name).toBe('alice')
  })

  it('passes email filter when email input changes', () => {
    renderUsers()
    const emailInput = screen.getByRole('textbox', { name: /依 email 搜尋/i })
    fireEvent.change(emailInput, { target: { value: 'alice@' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.email).toBe('alice@')
  })

  it('passes id filter when id input changes', () => {
    renderUsers()
    const idInput = screen.getByRole('spinbutton', { name: /依 id 搜尋/i })
    fireEvent.change(idInput, { target: { value: '5' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.id).toBe(5)
  })

  it('passes status filter when select changes', () => {
    renderUsers()
    const select = screen.getByRole('combobox', { name: /狀態篩選/i })
    fireEvent.change(select, { target: { value: 'active' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.status).toBe('active')
  })

  it('passes createdFrom filter when date input changes', () => {
    renderUsers()
    const fromInput = screen.getByLabelText('建立日期起')
    fireEvent.change(fromInput, { target: { value: '2026-02-01' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.createdFrom).toBe('2026-02-01')
  })

  it('passes createdTo filter when date input changes', () => {
    renderUsers()
    const toInput = screen.getByLabelText('建立日期迄')
    fireEvent.change(toInput, { target: { value: '2026-02-28' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.createdTo).toBe('2026-02-28')
  })

  it('resets page to 1 when email filter changes', () => {
    renderUsers()
    const emailInput = screen.getByRole('textbox', { name: /依 email 搜尋/i })
    fireEvent.change(emailInput, { target: { value: 'bob' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.page).toBe(1)
  })

  it('resets page to 1 when id filter changes', () => {
    renderUsers()
    const idInput = screen.getByRole('spinbutton', { name: /依 id 搜尋/i })
    fireEvent.change(idInput, { target: { value: '3' } })
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.page).toBe(1)
  })

  it('does not include id param when id input is empty', () => {
    renderUsers()
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.id).toBeUndefined()
  })

  it('does not include email param when email input is empty', () => {
    renderUsers()
    const table = screen.getByTestId('users-table')
    const params = JSON.parse(table.dataset.params ?? '{}')
    expect(params.email).toBeUndefined()
  })
})
