import { describe, it, expect } from 'vitest'
import { loginRequestSchema, loginResponseSchema } from '../auth.schemas'

describe('loginRequestSchema', () => {
  it('should accept valid credentials', () => {
    const result = loginRequestSchema.safeParse({
      username: 'admin',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty username', () => {
    const result = loginRequestSchema.safeParse({
      username: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short password', () => {
    const result = loginRequestSchema.safeParse({
      username: 'admin',
      password: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('should accept password with exactly 6 characters', () => {
    const result = loginRequestSchema.safeParse({
      username: 'admin',
      password: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing fields', () => {
    const result = loginRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('loginResponseSchema', () => {
  it('should accept valid login response', () => {
    const result = loginResponseSchema.safeParse({
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 300,
      user: { username: 'admin', role: 'admin' },
    })
    expect(result.success).toBe(true)
  })

  it('should reject response without user', () => {
    const result = loginResponseSchema.safeParse({
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 300,
    })
    expect(result.success).toBe(false)
  })

  it('should reject response with non-number expires_in', () => {
    const result = loginResponseSchema.safeParse({
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: '300',
      user: { username: 'admin', role: 'admin' },
    })
    expect(result.success).toBe(false)
  })
})
