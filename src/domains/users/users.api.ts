import { apiClient } from '@/shared/api/client'
import type { UsersParams, UsersResponse } from './users.types'

export const usersApi = {
  getUsers: (params: UsersParams = {}): Promise<UsersResponse> =>
    apiClient.get<UsersResponse>('/api/users', { params }).then((r) => r.data),
}
