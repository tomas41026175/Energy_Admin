import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/ui/Button'

const ELLIPSIS = '...' as const

const getPageWindow = (current: number, total: number): (number | typeof ELLIPSIS)[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, ELLIPSIS, total]
  if (current >= total - 3) return [1, ELLIPSIS, total - 4, total - 3, total - 2, total - 1, total]
  return [1, ELLIPSIS, current - 1, current, current + 1, ELLIPSIS, total]
}

const CHEVRON_POINTS = {
  left: '15 18 9 12 15 6',
  right: '9 18 15 12 9 6',
} as const

const ChevronIcon = ({ direction }: { direction: keyof typeof CHEVRON_POINTS }) => (
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
