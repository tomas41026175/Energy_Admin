import { useMemo, useState } from 'react'
import { useUsers } from './users.hooks'
import type { User, UsersParams } from './users.types'
import { cn } from '@/shared/utils/cn'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Button } from '@/shared/ui/Button'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { StatusBadge } from '@/shared/components/StatusBadge'

type SortField = 'id' | 'name' | 'created_at'
type SortOrder = 'asc' | 'desc'

interface UsersTableProps {
  params: UsersParams
  onPageChange: (page: number) => void
  searchQuery?: string
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

export const UsersTable = ({ params, onPageChange, searchQuery }: UsersTableProps) => {
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useUsers(params)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Client-side sort — note: sorts only within the current page (API has no sort support)
  const sortedUsers = useMemo(() => {
    if (!data?.data || !sortField) return data?.data ?? []
    return [...data.data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal))
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [data?.data, sortField, sortOrder])

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

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
    return searchQuery ? (
      <EmptyState
        title="找不到符合的使用者"
        description={`找不到符合「${searchQuery}」的使用者，請嘗試其他關鍵字。`}
      />
    ) : (
      <EmptyState title="找不到使用者" description="目前沒有使用者資料。" />
    )
  }

  const { pagination } = data

  return (
    <div className={cn('relative', isPlaceholderData && 'opacity-60')}>
      {/* Fetching indicator (shown when switching pages with cached data) */}
      {isPlaceholderData && (
        <div className="absolute top-2 right-2 z-10">
          <Spinner size="sm" />
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-3">
        共 {pagination.total} 筆結果
      </p>

      {/* Desktop / Tablet table (hidden on mobile) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader
                label="ID"
                field="id"
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                className="px-4 py-3"
              />
              <SortableHeader
                label="姓名"
                field="name"
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                className="px-4 py-3"
              />
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
              <SortableHeader
                label="建立日期"
                field="created_at"
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                className="hidden lg:table-cell px-4 py-3"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <TableRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list (hidden on sm+) */}
      <div className="sm:hidden space-y-3">
        {sortedUsers.map((user) => (
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


interface SortableHeaderProps {
  label: string
  field: SortField
  sortField: SortField | null
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  className?: string
}

const SortableHeader = ({ label, field, sortField, sortOrder, onSort, className }: SortableHeaderProps) => (
  <th
    scope="col"
    className={cn('text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}
  >
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      aria-label={`依${label}排序`}
    >
      {label}
      <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
    </button>
  </th>
)

interface SortIconProps {
  field: SortField
  sortField: SortField | null
  sortOrder: SortOrder
}

const SortIcon = ({ field, sortField, sortOrder }: SortIconProps) => {
  const isActive = sortField === field
  return (
    <span className="inline-flex flex-col" aria-hidden="true">
      <span className={cn('leading-none text-[10px]', isActive && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300')}>▲</span>
      <span className={cn('leading-none text-[10px]', isActive && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300')}>▼</span>
    </span>
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
