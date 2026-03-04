import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { apiClient } from './client'
import { tokenStore } from './token-store'
import { normalizeAxiosError } from './error-handler'
import { AuthError } from './error'

interface QueueItem {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
  const queue = [...failedQueue]
  failedQueue = []

  queue.forEach((item) => {
    if (error) {
      item.reject(error)
    } else if (token) {
      item.resolve(token)
    }
  })
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(normalizeAxiosError(error))
    }

    const isTokenExpired =
      error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED'

    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')

    if (!isTokenExpired || isRefreshRequest) {
      return Promise.reject(normalizeAxiosError(error))
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue = [...failedQueue, { resolve, reject }]
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    isRefreshing = true

    try {
      const refreshToken = tokenStore.getRefreshToken()
      if (!refreshToken) {
        throw new AuthError('登入憑證不存在，請重新登入')
      }

      const response = await apiClient.post<{
        access_token: string
        expires_in: number
      }>('/auth/refresh', { refresh_token: refreshToken })

      const { access_token } = response.data

      tokenStore.setAccessToken(access_token)
      // Refresh token stays in localStorage; /auth/refresh does not rotate it

      processQueue(null, access_token)

      originalRequest.headers.Authorization = `Bearer ${access_token}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStore.clearAll()
      return Promise.reject(new AuthError('登入工作階段已過期，請重新登入'))
    } finally {
      isRefreshing = false
    }
  },
)

export { apiClient }
