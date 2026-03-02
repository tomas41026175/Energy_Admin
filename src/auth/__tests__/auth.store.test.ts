import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useAuthStore } from '../auth.store'
import { tokenStore } from '@/shared/api/token-store'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  tokenStore.clearAll()
  localStorage.clear()
})

afterEach(() => {
  server.resetHandlers()
})

describe('auth store - login', () => {
  it('should set user and tokens after successful login', async () => {
    server.use(
      http.post(`${API_BASE}/auth`, () => {
        return HttpResponse.json({
          access_token: 'test-access',
          refresh_token: 'test-refresh',
          expires_in: 300,
          user: { username: 'admin', role: 'admin' },
        })
      }),
    )

    await useAuthStore.getState().login({ username: 'admin', password: 'password123' })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.username).toBe('admin')
    expect(tokenStore.getAccessToken()).toBe('test-access')
    expect(tokenStore.getRefreshToken()).toBe('test-refresh')
  })

  it('should throw and not set state on failed login', async () => {
    server.use(
      http.post(`${API_BASE}/auth`, () => {
        return HttpResponse.json({ message: 'Invalid' }, { status: 401 })
      }),
    )

    await expect(
      useAuthStore.getState().login({ username: 'bad', password: 'wrong1' }),
    ).rejects.toThrow()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })
})

describe('auth store - logout', () => {
  it('should clear user, tokens, and authentication state', () => {
    useAuthStore.setState({
      user: { username: 'admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    })
    tokenStore.setAccessToken('token')
    tokenStore.setRefreshToken('refresh')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(tokenStore.getRefreshToken()).toBeNull()
  })
})

describe('auth store - restoreSession', () => {
  it('should restore session from refresh token and stored user', async () => {
    tokenStore.setRefreshToken('valid-refresh')
    localStorage.setItem('auth_user', JSON.stringify({ username: 'admin', role: 'admin' }))

    server.use(
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({
          access_token: 'restored-access',
          expires_in: 300,
        })
      }),
    )

    await useAuthStore.getState().restoreSession()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.username).toBe('admin')
    expect(state.isLoading).toBe(false)
    expect(tokenStore.getAccessToken()).toBe('restored-access')
  })

  it('should clear state when no refresh token exists', async () => {
    await useAuthStore.getState().restoreSession()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should clear state when refresh fails', async () => {
    tokenStore.setRefreshToken('expired-refresh')

    server.use(
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({ message: 'Invalid' }, { status: 401 })
      }),
    )

    await useAuthStore.getState().restoreSession()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(tokenStore.getRefreshToken()).toBeNull()
  })

  it('should clear state when refresh succeeds but no stored user', async () => {
    tokenStore.setRefreshToken('valid-refresh')

    server.use(
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({
          access_token: 'restored-access',
          expires_in: 300,
        })
      }),
    )

    await useAuthStore.getState().restoreSession()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })
})
