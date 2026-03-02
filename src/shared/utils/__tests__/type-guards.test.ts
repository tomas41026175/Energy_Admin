import { describe, it, expect } from 'vitest'
import { isApiError, isAuthError, isNetworkError, isServerError } from '../type-guards'
import { AuthError, NetworkError, ServerError, AppError } from '../../api/error'

describe('isApiError', () => {
  it('should return true for object with message string', () => {
    expect(isApiError({ message: 'error' })).toBe(true)
  })

  it('should return true for object with message and code', () => {
    expect(isApiError({ message: 'error', code: 'ERR' })).toBe(true)
  })

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false)
  })

  it('should return false for string', () => {
    expect(isApiError('error')).toBe(false)
  })

  it('should return false for number', () => {
    expect(isApiError(42)).toBe(false)
  })

  it('should return false for object without message', () => {
    expect(isApiError({ code: 'ERR' })).toBe(false)
  })

  it('should return false for object with non-string message', () => {
    expect(isApiError({ message: 123 })).toBe(false)
  })
})

describe('isAuthError', () => {
  it('should return true for AuthError instance', () => {
    expect(isAuthError(new AuthError())).toBe(true)
  })

  it('should return false for generic AppError', () => {
    expect(isAuthError(new AppError('error'))).toBe(false)
  })

  it('should return false for non-error object', () => {
    expect(isAuthError({ message: 'Unauthorized' })).toBe(false)
  })

  it('should return false for null', () => {
    expect(isAuthError(null)).toBe(false)
  })
})

describe('isNetworkError', () => {
  it('should return true for NetworkError instance', () => {
    expect(isNetworkError(new NetworkError())).toBe(true)
  })

  it('should return false for generic AppError', () => {
    expect(isNetworkError(new AppError('error'))).toBe(false)
  })

  it('should return false for plain object', () => {
    expect(isNetworkError({ message: 'Network error' })).toBe(false)
  })
})

describe('isServerError', () => {
  it('should return true for ServerError instance', () => {
    expect(isServerError(new ServerError())).toBe(true)
  })

  it('should return true for ServerError with status', () => {
    expect(isServerError(new ServerError('Bad gateway', 502))).toBe(true)
  })

  it('should return false for generic AppError', () => {
    expect(isServerError(new AppError('error'))).toBe(false)
  })

  it('should return false for plain object', () => {
    expect(isServerError({ message: 'Server error' })).toBe(false)
  })
})
