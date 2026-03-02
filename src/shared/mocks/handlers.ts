import { http, HttpResponse } from 'msw'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

export const handlers = [
  http.get(`${API_BASE}/api/users`, () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Test User', email: 'test@example.com', status: 'active' },
      ],
      pagination: { total: 1, current_page: 1, per_page: 10, total_pages: 1 },
    })
  }),

  http.post(`${API_BASE}/auth`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    })
  }),

  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    })
  }),
]
