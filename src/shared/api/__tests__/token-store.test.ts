import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStore } from '../token-store'

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clearAll()
    localStorage.clear()
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
