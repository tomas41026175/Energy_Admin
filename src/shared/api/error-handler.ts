import { AxiosError } from 'axios'
import { AppError, AuthError, NetworkError, ServerError, ValidationError } from './error'

export type ErrorSeverity = 'critical' | 'recoverable' | 'warning' | 'validation'

export interface ClassifiedError {
  severity: ErrorSeverity
  error: AppError
  shouldLogout: boolean
}

export const classifyError = (error: unknown): ClassifiedError => {
  if (error instanceof AuthError) {
    return {
      severity: 'critical',
      error,
      shouldLogout: true,
    }
  }

  if (error instanceof ServerError) {
    return {
      severity: 'critical',
      error,
      shouldLogout: false,
    }
  }

  if (error instanceof NetworkError) {
    return {
      severity: 'recoverable',
      error,
      shouldLogout: false,
    }
  }

  if (error instanceof ValidationError) {
    return {
      severity: 'validation',
      error,
      shouldLogout: false,
    }
  }

  if (error instanceof AppError) {
    return {
      severity: 'warning',
      error,
      shouldLogout: false,
    }
  }

  return {
    severity: 'warning',
    error: new AppError(error instanceof Error ? error.message : '發生未知錯誤'),
    shouldLogout: false,
  }
}

export const normalizeAxiosError = (error: AxiosError<{ message?: string }>): AppError => {
  if (!error.response) {
    return new NetworkError(error.message)
  }

  const status = error.response.status
  const message = error.response.data?.message ?? error.message

  if (status === 401) {
    return new AuthError('帳號或密碼錯誤，請重新確認')
  }

  if (status === 400) {
    return new ValidationError(message)
  }

  if (status >= 500) {
    return new ServerError(message, status)
  }

  return new AppError(message, String(status))
}
