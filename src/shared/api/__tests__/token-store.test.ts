import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { tokenStore } from '../token-store'

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clearAll()
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('access token', () => {
    it('returns null initially', () => {
      expect(tokenStore.getAccessToken()).toBeNull()
    })

    it('sets and gets access token', () => {
      tokenStore.setAccessToken('abc123')
      expect(tokenStore.getAccessToken()).toBe('abc123')
    })

    it('sets access token to null', () => {
      tokenStore.setAccessToken('abc123')
      tokenStore.setAccessToken(null)
      expect(tokenStore.getAccessToken()).toBeNull()
    })

    it('returns token before expiry when expiresIn provided', () => {
      vi.useFakeTimers()
      tokenStore.setAccessToken('valid-token', 300)
      vi.advanceTimersByTime(299_000)
      expect(tokenStore.getAccessToken()).toBe('valid-token')
    })

    it('returns null after expiry when expiresIn provided', () => {
      vi.useFakeTimers()
      tokenStore.setAccessToken('expiring-token', 300)
      vi.advanceTimersByTime(301_000)
      expect(tokenStore.getAccessToken()).toBeNull()
    })

    it('returns token indefinitely when no expiresIn provided', () => {
      vi.useFakeTimers()
      tokenStore.setAccessToken('no-expiry-token')
      vi.advanceTimersByTime(999_999_000)
      expect(tokenStore.getAccessToken()).toBe('no-expiry-token')
    })
  })

  describe('refresh token', () => {
    it('returns null when not set', () => {
      expect(tokenStore.getRefreshToken()).toBeNull()
    })

    it('sets and gets refresh token via localStorage', () => {
      tokenStore.setRefreshToken('refresh-xyz')
      expect(tokenStore.getRefreshToken()).toBe('refresh-xyz')
      expect(localStorage.getItem('refresh_token')).toBe('refresh-xyz')
    })

    it('removes refresh token from localStorage when set to null', () => {
      tokenStore.setRefreshToken('refresh-xyz')
      tokenStore.setRefreshToken(null)
      expect(tokenStore.getRefreshToken()).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('clearAll', () => {
    it('clears both access and refresh tokens', () => {
      tokenStore.setAccessToken('access')
      tokenStore.setRefreshToken('refresh')

      tokenStore.clearAll()

      expect(tokenStore.getAccessToken()).toBeNull()
      expect(tokenStore.getRefreshToken()).toBeNull()
    })
  })
})
