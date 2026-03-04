import { useMemo, useState } from 'react'
import { useUsers } from './users.hooks'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { EmptyState } from '@/shared/ui/EmptyState'
import { cn } from '@/shared/utils/cn'
import { SortableHeader } from './components/UsersTableHeader'
import { TableRow, UserCard } from './components/UsersTableRow'
import { UsersTablePagination } from './components/UsersTablePagination'
import type { SortField, SortOrder } from './components/UsersTableHeader'
import type { UsersParams } from './users.types'

interface UsersTableProps {
  params: UsersParams
  onPageChange: (page: number) => void
  searchQuery?: string
}

const SkeletonTable = () => (
  <div className="space-y-2" aria-label="載入使用者中" aria-busy="true">
    <Skeleton variant="rectangular" height={40} className="w-full" />
    {Array.from({ length: 5 }, (_, i) => (
      <Skeleton key={i} variant="rectangular" height={56} className="w-full" />
    ))}
  </div>
)

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

  if (isLoading && !data) return <SkeletonTable />

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
      {isPlaceholderData && (
        <div className="absolute top-2 right-2 z-10">
          <Spinner size="sm" />
        </div>
      )}

      <p className="text-sm text-gray-500 mb-3">共 {pagination.total} 筆結果</p>

      {/* Desktop / Tablet table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="ID" field="id" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} className="px-4 py-3" />
              <SortableHeader label="姓名" field="name" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} className="px-4 py-3" />
              <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
              <SortableHeader label="建立日期" field="created_at" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} className="hidden lg:table-cell px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user, index) => (
              <TableRow key={user.id} user={user} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {sortedUsers.map((user, index) => (
          <UserCard key={user.id} user={user} index={index} />
        ))}
      </div>

      <UsersTablePagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
