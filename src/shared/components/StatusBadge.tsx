import { cn } from '@/shared/utils/cn'

interface StatusBadgeProps {
  status: 'active' | 'inactive'
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
    )}
  >
    {status === 'active' ? '啟用' : '停用'}
  </span>
)
