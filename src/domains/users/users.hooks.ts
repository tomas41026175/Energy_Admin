import { useEffect } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { usersApi } from './users.api'
import { QUERY_STALE_TIME } from '@/shared/constants'
import type { UsersParams } from './users.types'

export const useUsers = (params: UsersParams) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  })

  // Prefetch next page while user is on the current page
  // useEffect allowed: prefetch is a side effect with no Query-native alternative
  useEffect(() => {
    const nextPage = (params.page ?? 1) + 1
    if (query.data && nextPage <= query.data.pagination.total_pages) {
      void queryClient.prefetchQuery({
        queryKey: ['users', { ...params, page: nextPage }],
        queryFn: () => usersApi.getUsers({ ...params, page: nextPage }),
        staleTime: QUERY_STALE_TIME,
      })
    }
  }, [query.data, params, queryClient])

  return query
}
