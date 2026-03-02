import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { authApi } from '../auth.api'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('authApi.login', () => {
  it('should return login response on success', async () => {
    server.use(
      http.post(`${API_BASE}/auth`, () => {
        return HttpResponse.json({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 300,
          user: { username: 'admin', role: 'admin' },
        })
      }),
    )

    const result = await authApi.login({ username: 'admin', password: 'password123' })

    expect(result.access_token).toBe('test-access-token')
    expect(result.refresh_token).toBe('test-refresh-token')
    expect(result.expires_in).toBe(300)
    expect(result.user.username).toBe('admin')
  })

  it('should throw on invalid credentials', async () => {
    server.use(
      http.post(`${API_BASE}/auth`, () => {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      }),
    )

    await expect(authApi.login({ username: 'bad', password: 'wrong1' })).rejects.toThrow()
  })
})

describe('authApi.refreshToken', () => {
  it('should return new access token on success', async () => {
    server.use(
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({
          access_token: 'new-access-token',
          expires_in: 300,
        })
      }),
    )

    const result = await authApi.refreshToken('old-refresh-token')

    expect(result.access_token).toBe('new-access-token')
    expect(result.expires_in).toBe(300)
  })

  it('should throw on invalid refresh token', async () => {
    server.use(
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
      }),
    )

    await expect(authApi.refreshToken('invalid-token')).rejects.toThrow()
  })
})
