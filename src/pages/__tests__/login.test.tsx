import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '@/auth/auth.store'

// Lazy import — the page is lazy-loaded in router, import directly here
vi.mock('@/auth/auth.store')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Import after mocks
const { default: LoginPage } = await import('../login')

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )

describe('LoginPage', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue(mockLogin as unknown as ReturnType<typeof useAuthStore>)
    // useAuthStore is called as selector: (s) => s.login
    // Zustand selector mock
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        login: mockLogin,
        logout: vi.fn(),
        user: null,
        isAuthenticated: false,
        isLoading: false,
        restoreSession: vi.fn(),
      }),
    )
  })

  it('renders username and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders skip to main content link', () => {
    renderLogin()
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
  })

  it('renders page heading', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /energy admin/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls login with credentials and navigates on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLogin()

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'admin', password: 'password123' })
      expect(mockNavigate).toHaveBeenCalledWith('/users', { replace: true })
    })
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    renderLogin()

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('shows generic error on non-Error failure', async () => {
    mockLogin.mockRejectedValueOnce('unknown error')
    renderLogin()

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Login failed')
    })
  })
})
