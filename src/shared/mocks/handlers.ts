import { http, HttpResponse } from 'msw'
import type { User } from '@/domains/users/users.types'

const API_BASE = 'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws'

const MOCK_USERS: User[] = [
  { id: 1, name: 'Alice Wang', email: 'alice@example.com', avatar: '', status: 'active', created_at: '2026-01-01' },
  { id: 2, name: 'Bob Chen', email: 'bob@example.com', avatar: '', status: 'inactive', created_at: '2026-01-05' },
  { id: 3, name: 'Carol Lin', email: 'carol@example.com', avatar: '', status: 'active', created_at: '2026-01-10' },
  { id: 4, name: 'David Liu', email: 'david@example.com', avatar: '', status: 'inactive', created_at: '2026-01-15' },
  { id: 5, name: 'Eve Huang', email: 'eve@example.com', avatar: '', status: 'active', created_at: '2026-01-20' },
  { id: 6, name: 'Frank Wu', email: 'frank@example.com', avatar: '', status: 'active', created_at: '2026-02-01' },
  { id: 7, name: 'Grace Cheng', email: 'grace@example.com', avatar: '', status: 'inactive', created_at: '2026-02-05' },
  { id: 8, name: 'Henry Tsai', email: 'henry@example.com', avatar: '', status: 'active', created_at: '2026-02-10' },
  { id: 9, name: 'Ivy Ho', email: 'ivy@example.com', avatar: '', status: 'inactive', created_at: '2026-02-15' },
  { id: 10, name: 'Jack Yang', email: 'jack@example.com', avatar: '', status: 'active', created_at: '2026-02-20' },
  { id: 11, name: 'Kate Liao', email: 'kate@example.com', avatar: '', status: 'active', created_at: '2026-03-01' },
  { id: 12, name: 'Leo Chou', email: 'leo@example.com', avatar: '', status: 'inactive', created_at: '2026-03-02' },
  { id: 13, name: 'Mia Hsu', email: 'mia@example.com', avatar: '', status: 'active', created_at: '2026-03-03' },
  { id: 14, name: 'Nick Pan', email: 'nick@example.com', avatar: '', status: 'inactive', created_at: '2026-03-04' },
  { id: 15, name: 'Olivia Su', email: 'olivia@example.com', avatar: '', status: 'active', created_at: '2026-03-05' },
]

export const handlers = [
  http.get(`${API_BASE}/api/users`, ({ request }) => {
    const url = new URL(request.url)
    const name = url.searchParams.get('name') ?? ''
    const email = url.searchParams.get('email') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10)

    let filtered = MOCK_USERS

    if (name) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (email) {
      filtered = filtered.filter(u => u.email.toLowerCase().includes(email.toLowerCase()))
    }
    if (status) {
      filtered = filtered.filter(u => u.status === status)
    }
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data,
      pagination: {
        total,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
      },
    })
  }),

  http.post(`${API_BASE}/auth`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 300,
      user: { username: 'admin', role: 'admin' },
    })
  }),

  http.post(`${API_BASE}/auth/refresh`, () => {
    // /auth/refresh 不旋轉 refresh_token，僅回傳新 access_token
    return HttpResponse.json({
      access_token: 'new-access-token',
      expires_in: 300,
    })
  }),
]
