import type { ApiError } from '@/types/common'
import { AuthError, NetworkError, ServerError } from '@/shared/api/error'

export const isApiError = (value: unknown): value is ApiError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  )
}

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError
}

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError
}

export const isServerError = (error: unknown): error is ServerError => {
  return error instanceof ServerError
}
