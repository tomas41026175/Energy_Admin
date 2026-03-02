import { describe, it, expect } from 'vitest'
import { userSchema, usersResponseSchema } from '../users.schemas'

describe('userSchema', () => {
  it('should accept valid user', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
      status: 'active',
      created_at: '2026-01-01',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'Test',
      email: 'not-an-email',
      avatar: '',
      status: 'active',
      created_at: '2026-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid status', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      avatar: '',
      status: 'unknown',
      created_at: '2026-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('should accept inactive status', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      avatar: '',
      status: 'inactive',
      created_at: '2026-01-01',
    })
    expect(result.success).toBe(true)
  })
})

describe('usersResponseSchema', () => {
  it('should accept valid users response', () => {
    const result = usersResponseSchema.safeParse({
      data: [
        { id: 1, name: 'User', email: 'user@test.com', avatar: '', status: 'active', created_at: '2026-01-01' },
      ],
      pagination: { total: 1, current_page: 1, per_page: 10, total_pages: 1 },
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty data array', () => {
    const result = usersResponseSchema.safeParse({
      data: [],
      pagination: { total: 0, current_page: 1, per_page: 10, total_pages: 0 },
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing pagination', () => {
    const result = usersResponseSchema.safeParse({
      data: [],
    })
    expect(result.success).toBe(false)
  })
})
