import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { usersApi } from './users.api'
import { QUERY_STALE_TIME } from '@/shared/constants'
import type { UsersParams } from './users.types'

export const useUsers = (params: UsersParams) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  })
