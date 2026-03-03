import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '@/auth/auth.store'
import { ToastProvider } from '@/shared/ui/Toast'

vi.mock('@/auth/auth.store')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div>Outlet Content</div>,
  }
})

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockLogout = vi.fn()

const { AppLayout } = await import('../AppLayout')

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true }

const renderAppLayout = () =>
  render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </MemoryRouter>,
  )

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: online
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        login: vi.fn(),
        logout: mockLogout,
        user: { username: 'adminuser', role: 'admin' },
        isAuthenticated: true,
        isLoading: false,
        restoreSession: vi.fn(),
      }),
    )
  })

  it('renders Outlet (main content area)', () => {
    renderAppLayout()
    expect(screen.getByText('Outlet Content')).toBeInTheDocument()
  })

  it('displays user.username in header', () => {
    renderAppLayout()
    expect(screen.getByText('adminuser')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    renderAppLayout()
    expect(screen.getByRole('button', { name: /登出/i })).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', () => {
    renderAppLayout()
    fireEvent.click(screen.getByRole('button', { name: /登出/i }))
    expect(mockLogout).toHaveBeenCalledOnce()
  })

  it('shows toast after logout', async () => {
    const { waitFor } = await import('@testing-library/react')
    renderAppLayout()
    fireEvent.click(screen.getByRole('button', { name: /登出/i }))
    await waitFor(() => {
      expect(screen.getByText('您已登出。')).toBeInTheDocument()
    })
  })

  it('renders sidebar with navigation links', () => {
    renderAppLayout()
    expect(screen.getByRole('link', { name: /儀表板/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /使用者/i })).toBeInTheDocument()
  })

  it('shows hamburger menu button on mobile', () => {
    renderAppLayout()
    expect(screen.getByRole('button', { name: /開啟選單/i })).toBeInTheDocument()
  })

  it('hamburger button toggles sidebar visibility', () => {
    renderAppLayout()
    const hamburger = screen.getByRole('button', { name: /開啟選單/i })
    fireEvent.click(hamburger)
    expect(screen.getByRole('button', { name: /關閉選單/i })).toBeInTheDocument()
  })

  it('does not show offline banner when online', () => {
    renderAppLayout()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows offline banner when offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    renderAppLayout()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/目前離線/)).toBeInTheDocument()
  })

  it('renders sidebar collapse toggle button on desktop', () => {
    renderAppLayout()
    expect(screen.getByRole('button', { name: /收合側欄/i })).toBeInTheDocument()
  })

  it('sidebar collapse toggle changes aria-label', () => {
    renderAppLayout()
    const collapseBtn = screen.getByRole('button', { name: /收合側欄/i })
    fireEvent.click(collapseBtn)
    expect(screen.getByRole('button', { name: /展開側欄/i })).toBeInTheDocument()
  })
})
