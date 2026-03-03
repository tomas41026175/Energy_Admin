import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useUsers } from '@/domains/users/users.hooks'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { cn } from '@/shared/utils/cn'
import type { User } from '@/domains/users/users.types'

// --- Stat Card ---

interface StatCardProps {
  label: string
  value: number | undefined
  isLoading: boolean
  isError: boolean
  colorClass: string
}

const StatCard = ({ label, value, isLoading, isError, colorClass }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-2">
    {isLoading ? (
      <Skeleton variant="rectangular" height={96} />
    ) : isError ? (
      <span className="text-sm text-red-500">載入失敗</span>
    ) : (
      <>
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={cn('text-3xl font-bold', colorClass)}>{value ?? '—'}</span>
      </>
    )}
  </div>
)


// --- Recent User Row ---

const RecentUserRow = ({ user }: { user: User }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
    <UserAvatar name={user.name} avatar={user.avatar} size="md" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
      <p className="text-xs text-gray-500 truncate">{user.email}</p>
    </div>
    <StatusBadge status={user.status} />
  </div>
)


// --- Active Ratio Pie Chart ---

const PIE_COLORS = ['#16a34a', '#9ca3af'] as const

interface ActiveRatioChartProps {
  active: number | undefined
  inactive: number | undefined
  isLoading: boolean
}

const ActiveRatioChart = ({ active, inactive, isLoading }: ActiveRatioChartProps) => {
  const data = [
    { name: '啟用', value: active ?? 0 },
    { name: '停用', value: inactive ?? 0 },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">使用者狀態分佈</h2>
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | undefined) => value != null ? `${value} 人` : ''} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}


// --- Dashboard Page ---

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
        <StatCard
          label="總使用者"
          value={totalQuery.data?.pagination.total}
          isLoading={statsLoading}
          isError={totalQuery.isError}
          colorClass="text-blue-600"
        />
        <StatCard
          label="活躍"
          value={activeQuery.data?.pagination.total}
          isLoading={statsLoading}
          isError={activeQuery.isError}
          colorClass="text-green-600"
        />
        <StatCard
          label="停用"
          value={inactiveQuery.data?.pagination.total}
          isLoading={statsLoading}
          isError={inactiveQuery.isError}
          colorClass="text-gray-600"
        />
      </div>

      {/* Active Ratio Pie Chart */}
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
