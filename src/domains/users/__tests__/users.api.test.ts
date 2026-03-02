import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { usersApi } from '../users.api'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('usersApi.getUsers', () => {
  it('should return users list with pagination', async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, () => {
        return HttpResponse.json({
          data: [
            { id: 1, name: 'User 1', email: 'user1@test.com', avatar: '', status: 'active', created_at: '2026-01-01' },
          ],
          pagination: { total: 1, current_page: 1, per_page: 10, total_pages: 1 },
        })
      }),
    )

    const result = await usersApi.getUsers()

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('User 1')
    expect(result.pagination.total).toBe(1)
  })

  it('should pass query params', async () => {
    let capturedUrl = ''

    server.use(
      http.get(`${API_BASE}/api/users`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          data: [],
          pagination: { total: 0, current_page: 2, per_page: 5, total_pages: 0 },
        })
      }),
    )

    await usersApi.getUsers({ page: 2, limit: 5 })

    expect(capturedUrl).toContain('page=2')
    expect(capturedUrl).toContain('limit=5')
  })

  it('should throw on server error', async () => {
    server.use(
      http.get(`${API_BASE}/api/users`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      }),
    )

    await expect(usersApi.getUsers()).rejects.toThrow()
  })
})
