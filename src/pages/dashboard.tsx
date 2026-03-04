import { useUsers } from '@/domains/users/users.hooks'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StatCard } from '@/domains/users/components/StatCard'
import { RecentUserRow } from '@/domains/users/components/RecentUserRow'
import { ActiveRatioChart } from '@/domains/users/components/ActiveRatioChart'

// Note: 4 separate useUsers() calls are intentional — each fetches a distinct dataset
// (total / active / inactive / recent-5). TanStack Query caches by queryKey with
// staleTime=30s, preventing unnecessary refetches.
const DashboardPage = () => {
  const totalQuery = useUsers({})
  const activeQuery = useUsers({ status: 'active' })
  const inactiveQuery = useUsers({ status: 'inactive' })
  const recentQuery = useUsers({ page: 1, limit: 5 })

  const statsLoading = totalQuery.isLoading || activeQuery.isLoading || inactiveQuery.isLoading

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">儀表板</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="總使用者" value={totalQuery.data?.pagination.total} isLoading={statsLoading} isError={totalQuery.isError} colorClass="text-blue-600" />
        <StatCard label="活躍" value={activeQuery.data?.pagination.total} isLoading={statsLoading} isError={activeQuery.isError} colorClass="text-green-600" />
        <StatCard label="停用" value={inactiveQuery.data?.pagination.total} isLoading={statsLoading} isError={inactiveQuery.isError} colorClass="text-gray-600" />
      </div>

      <ActiveRatioChart
        active={activeQuery.data?.pagination.total}
        inactive={inactiveQuery.data?.pagination.total}
        isLoading={statsLoading}
      />

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">最近使用者</h2>

        {recentQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} variant="rectangular" height={52} />
            ))}
          </div>
        ) : recentQuery.isError ? (
          <ErrorMessage
            message={recentQuery.error?.message ?? '載入使用者失敗'}
            onRetry={() => void recentQuery.refetch()}
          />
        ) : (
          <div>
            {(recentQuery.data?.data ?? []).map((user) => (
              <RecentUserRow key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
