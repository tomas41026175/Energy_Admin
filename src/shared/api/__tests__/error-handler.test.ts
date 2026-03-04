import { describe, it, expect } from 'vitest'
import { classifyError, normalizeAxiosError } from '../error-handler'
import { AppError, AuthError, NetworkError, ServerError, ValidationError } from '../error'
import { AxiosError, type AxiosResponse } from 'axios'

describe('classifyError', () => {
  it('should classify AuthError as critical with shouldLogout', () => {
    const result = classifyError(new AuthError())
    expect(result.severity).toBe('critical')
    expect(result.shouldLogout).toBe(true)
  })

  it('should classify ServerError as critical without shouldLogout', () => {
    const result = classifyError(new ServerError('Internal', 500))
    expect(result.severity).toBe('critical')
    expect(result.shouldLogout).toBe(false)
  })

  it('should classify NetworkError as recoverable', () => {
    const result = classifyError(new NetworkError())
    expect(result.severity).toBe('recoverable')
    expect(result.shouldLogout).toBe(false)
  })

  it('should classify ValidationError as validation', () => {
    const result = classifyError(new ValidationError('Bad input'))
    expect(result.severity).toBe('validation')
    expect(result.shouldLogout).toBe(false)
  })

  it('should classify generic AppError as warning', () => {
    const result = classifyError(new AppError('Something went wrong'))
    expect(result.severity).toBe('warning')
    expect(result.shouldLogout).toBe(false)
  })

  it('should classify unknown Error as warning', () => {
    const result = classifyError(new Error('unknown'))
    expect(result.severity).toBe('warning')
    expect(result.error).toBeInstanceOf(AppError)
    expect(result.error.message).toBe('unknown')
  })

  it('should classify non-Error value as warning with fallback message', () => {
    const result = classifyError('string error')
    expect(result.severity).toBe('warning')
    expect(result.error.message).toBe('發生未知錯誤')
  })
})

describe('normalizeAxiosError', () => {
  const createAxiosError = (
    status: number | undefined,
    data?: { message?: string },
    message = 'Request failed',
  ): AxiosError<{ message?: string }> => {
    const error = new AxiosError<{ message?: string }>(message)
    if (status !== undefined) {
      error.response = {
        status,
        data: data ?? {},
        headers: {},
        statusText: '',
        config: { headers: {} },
      } as AxiosResponse<{ message?: string }>
    }
    return error
  }

  it('should return NetworkError when no response', () => {
    const error = createAxiosError(undefined)
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(NetworkError)
  })

  it('should return AuthError for 401', () => {
    const error = createAxiosError(401, { message: 'Unauthorized' })
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(AuthError)
    expect(result.message).toBe('帳號或密碼錯誤，請重新確認')
  })

  it('should return ValidationError for 400', () => {
    const error = createAxiosError(400, { message: 'Bad request' })
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('should return ServerError for 500', () => {
    const error = createAxiosError(500, { message: 'Internal server error' })
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(ServerError)
  })

  it('should return ServerError for 502', () => {
    const error = createAxiosError(502, { message: 'Bad gateway' })
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(ServerError)
  })

  it('should return AppError for other status codes', () => {
    const error = createAxiosError(403, { message: 'Forbidden' })
    const result = normalizeAxiosError(error)
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('請求失敗，請稍後再試')
  })

  it('should use fixed Chinese message for 500 regardless of backend message', () => {
    const error = createAxiosError(500, {}, 'Network Error')
    const result = normalizeAxiosError(error)
    expect(result.message).toBe('伺服器錯誤，請稍後再試')
  })
})
