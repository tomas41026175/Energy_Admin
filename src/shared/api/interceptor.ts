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
        throw new AuthError('No refresh token available')
      }

      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
      }>('/auth/refresh', { refresh_token: refreshToken })

      const { access_token, refresh_token } = response.data

      tokenStore.setAccessToken(access_token)
      tokenStore.setRefreshToken(refresh_token)

      processQueue(null, access_token)

      originalRequest.headers.Authorization = `Bearer ${access_token}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStore.clearAll()
      return Promise.reject(new AuthError('Session expired'))
    } finally {
      isRefreshing = false
    }
  },
)

export { apiClient }
