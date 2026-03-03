import { useUsers } from './users.hooks'
import type { User, UsersParams } from './users.types'
import { cn } from '@/shared/utils/cn'
import { Skeleton } from '@/shared/ui/Skeleton'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Button } from '@/shared/ui/Button'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'

interface UsersTableProps {
  params: UsersParams
  onPageChange: (page: number) => void
}

const formatDateUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(isDateOnly ? {} : { hour: '2-digit', minute: '2-digit' }),
  }).format(date)
}

export const UsersTable = ({ params, onPageChange }: UsersTableProps) => {
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useUsers(params)

  if (isLoading && !data) {
    return <SkeletonTable />
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message ?? '載入使用者失敗'}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return <EmptyState title="找不到使用者" description="目前沒有使用者資料。" />
  }

  const { pagination } = data

  return (
    <div className={cn('relative', isPlaceholderData && 'opacity-60')}>
      {/* Desktop / Tablet table (hidden on mobile) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                姓名
              </th>
              <th
                scope="col"
                className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                狀態
              </th>
              <th
                scope="col"
                className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                建立日期
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map((user) => (
              <TableRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list (hidden on sm+) */}
      <div className="sm:hidden space-y-3">
        {data.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={onPageChange}
      />
    </div>
  )
}


interface TableRowProps {
  user: User
}

const TableRow = ({ user }: TableRowProps) => (
  <tr className="hover:bg-gray-50 transition-colors duration-100">
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex items-center gap-2.5">
        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
        <span className="text-sm font-medium text-gray-900">{user.name}</span>
      </div>
    </td>
    <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {user.email}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      <StatusBadge status={user.status} />
    </td>
    <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {formatDateUTC8(user.created_at)}
    </td>
  </tr>
)

interface UserCardProps {
  user: User
}

const UserCard = ({ user }: UserCardProps) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-fade-in">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={user.name} avatar={user.avatar} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">ID: {user.id}</p>
        </div>
      </div>
      <StatusBadge status={user.status} />
    </div>
    <p className="text-xs text-gray-400 mt-2 text-right">{formatDateUTC8(user.created_at)}</p>
  </div>
)


const ELLIPSIS = '...' as const

const getPageWindow = (current: number, total: number): (number | typeof ELLIPSIS)[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, ELLIPSIS, total]
  if (current >= total - 3) return [1, ELLIPSIS, total - 4, total - 3, total - 2, total - 1, total]
  return [1, ELLIPSIS, current - 1, current, current + 1, ELLIPSIS, total]
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const CHEVRON_POINTS = {
  left: '15 18 9 12 15 6',
  right: '9 18 15 12 9 6',
} as const

interface ChevronIconProps {
  direction: keyof typeof CHEVRON_POINTS
}

const ChevronIcon = ({ direction }: ChevronIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points={CHEVRON_POINTS[direction]} />
  </svg>
)

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="分頁" className="flex items-center justify-center gap-1 py-4">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="前往上一頁"
        className="px-2"
      >
        <ChevronIcon direction="left" />
      </Button>

      {getPageWindow(currentPage, totalPages).map((page, idx) => (
        <button
          key={typeof page === 'number' ? page : `ellipsis-${idx}`}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number'}
          aria-label={typeof page === 'number' ? `前往第 ${page} 頁` : undefined}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'w-8 h-8 flex items-center justify-center text-sm rounded-lg border transition-colors duration-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : typeof page === 'number'
                ? 'border-gray-200 hover:bg-gray-50'
                : 'cursor-default border-transparent text-gray-400',
          )}
        >
          {page}
        </button>
      ))}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="前往下一頁"
        className="px-2"
      >
        <ChevronIcon direction="right" />
      </Button>
    </nav>
  )
}

const SkeletonTable = () => (
  <div className="space-y-2" aria-label="載入使用者中" aria-busy="true">
    <Skeleton variant="rectangular" height={40} className="w-full" />
    {Array.from({ length: 5 }, (_, i) => (
      <Skeleton key={i} variant="rectangular" height={56} className="w-full" />
    ))}
  </div>
)
