import { apiClient } from '@/shared/api/client'
import type { LoginRequest, LoginResponse } from './auth.types'

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth', data).then((r) => r.data),

  refreshToken: (
    refresh_token: string,
  ): Promise<{ access_token: string; expires_in: number }> =>
    apiClient
      .post<{ access_token: string; expires_in: number }>('/auth/refresh', {
        refresh_token,
      })
      .then((r) => r.data),
}
