import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { apiClient } from '../client'
import { tokenStore } from '../token-store'
import { AuthError } from '../error'

// Import interceptor to register it
import '../interceptor'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  tokenStore.clearAll()
})

describe('request interceptor', () => {
  it('should attach Authorization header when token exists', async () => {
    tokenStore.setAccessToken('test-token')

    let capturedAuth: string | undefined

    server.use(
      http.get(`${API_BASE}/api/test`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? undefined
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient.get('/api/test')

    expect(capturedAuth).toBe('Bearer test-token')
  })

  it('should not attach Authorization header when no token', async () => {
    let capturedAuth: string | null = null

    server.use(
      http.get(`${API_BASE}/api/test`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient.get('/api/test')

    expect(capturedAuth).toBeNull()
  })
})

describe('response interceptor - token refresh', () => {
  beforeEach(() => {
    tokenStore.setAccessToken('expired-token')
    tokenStore.setRefreshToken('valid-refresh-token')
  })

  it('should refresh token on 401 TOKEN_EXPIRED and retry', async () => {
    let callCount = 0

    server.use(
      http.get(`${API_BASE}/api/protected`, ({ request }) => {
        callCount++
        const auth = request.headers.get('Authorization')

        if (auth === 'Bearer expired-token') {
          return HttpResponse.json(
            { message: 'Token expired', code: 'TOKEN_EXPIRED' },
            { status: 401 },
          )
        }

        if (auth === 'Bearer new-access-token') {
          return HttpResponse.json({ data: 'success' })
        }

        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }),
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({
          access_token: 'new-access-token',
          expires_in: 300,
        })
      }),
    )

    const response = await apiClient.get('/api/protected')

    expect(response.data).toEqual({ data: 'success' })
    expect(callCount).toBe(2)
    expect(tokenStore.getAccessToken()).toBe('new-access-token')
    // Refresh token is NOT rotated by /auth/refresh — original stays intact
    expect(tokenStore.getRefreshToken()).toBe('valid-refresh-token')
  })

  it('should clear tokens and reject when refresh fails', async () => {
    server.use(
      http.get(`${API_BASE}/api/protected`, () => {
        return HttpResponse.json(
          { message: 'Token expired', code: 'TOKEN_EXPIRED' },
          { status: 401 },
        )
      }),
      http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
      }),
    )

    await expect(apiClient.get('/api/protected')).rejects.toThrow(AuthError)

    expect(tokenStore.getAccessToken()).toBeNull()
    expect(tokenStore.getRefreshToken()).toBeNull()
  })

  it('should not refresh on non-TOKEN_EXPIRED 401', async () => {
    let refreshCalled = false

    server.use(
      http.get(`${API_BASE}/api/protected`, () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }),
      http.post(`${API_BASE}/auth/refresh`, () => {
        refreshCalled = true
        return HttpResponse.json({
          access_token: 'new-access-token',
          expires_in: 300,
        })
      }),
    )

    await expect(apiClient.get('/api/protected')).rejects.toThrow()

    expect(refreshCalled).toBe(false)
  })
})
