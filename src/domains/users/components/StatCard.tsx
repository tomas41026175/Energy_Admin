import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/utils/cn'

interface StatCardProps {
  label: string
  value: number | undefined
  isLoading: boolean
  isError: boolean
  colorClass: string
}

export const StatCard = ({ label, value, isLoading, isError, colorClass }: StatCardProps) => (
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
