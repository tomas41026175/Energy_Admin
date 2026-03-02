import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { usersApi } from './users.api'
import type { UsersParams } from './users.types'

export const useUsers = (params: UsersParams) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
