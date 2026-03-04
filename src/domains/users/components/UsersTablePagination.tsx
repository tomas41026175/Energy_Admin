import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/ui/Button'
import { ChevronIcon } from '@/shared/icons'
import { PAGINATION_WINDOW_SIZE } from '@/shared/constants'

const ELLIPSIS = '...' as const

const getPageWindow = (current: number, total: number): (number | typeof ELLIPSIS)[] => {
  // 頁數少於等於視窗大小，直接全部顯示
  if (total <= PAGINATION_WINDOW_SIZE) return Array.from({ length: total }, (_, i) => i + 1)
  // 目前頁靠近開頭：顯示前 5 頁 + 省略 + 最後一頁
  if (current <= 4) return [1, 2, 3, 4, 5, ELLIPSIS, total]
  // 目前頁靠近末尾：顯示第一頁 + 省略 + 最後 5 頁
  if (current >= total - 3) return [1, ELLIPSIS, total - 4, total - 3, total - 2, total - 1, total]
  // 目前頁在中間：顯示第一頁 + 省略 + 前後各一頁 + 省略 + 最後一頁
  return [1, ELLIPSIS, current - 1, current, current + 1, ELLIPSIS, total]
}

interface UsersTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const UsersTablePagination = ({ currentPage, totalPages, onPageChange }: UsersTablePaginationProps) => {
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
            'w-8 h-8 flex items-center justify-center text-sm rounded-lg border transition duration-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : typeof page === 'number'
                ? 'border-gray-200 hover:bg-gray-50 hover:scale-105'
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
